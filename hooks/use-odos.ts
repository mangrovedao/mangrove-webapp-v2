import { TradeMode } from "@/app/trade/_components/forms/enums"
import { successToast } from "@/app/trade/_components/forms/utils"
import { getTokenByAddressOdos } from "@/utils/tokens"
import { BS, MarketOrderSimulationResult } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Address, erc20Abi } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

const ODOS_API_URL = "https://api.odos.xyz"
const ODOS_API_ROUTES = {
  TOKEN_LIST: (chainId: number) => `/info/tokens/${chainId}`,
  QUOTE: "/sor/quote/v2",
  ASSEMBLE: "/sor/assemble",
  ROUTER_CONTRACT: (chainId: number) => `/info/router/v2/${chainId}`,
}
export const ODOS_API_IMAGE_URL = (symbol: string) =>
  `https://assets.odos.xyz/tokens/${symbol}.webp`

export interface QuoteParams {
  chainId?: number
  inputTokens: {
    tokenAddress: Address
    amount: string
  }[]
  outputTokens: {
    tokenAddress: Address
    proportion: number
  }[]
  userAddr?: Address
  slippageLimitPercent: number
}

export interface AssembledTransaction {
  gas: number
  gasPrice: number
  value: string
  to: string
  from: string
  data: string
  nonce: number
  chainId: number
}

const DEFAULT_ODOS_CHAIN_ID = 42161

export function useOdos() {
  const { chainId: chainIdConnected } = useAccount()
  const [chainId, setChainId] = useState<number>(DEFAULT_ODOS_CHAIN_ID)
  const { address: userAddr } = useAccount()
  const [lastRequest, setLastRequest] = useState<{
    tokenToSell: Address
    tokenToBuy: Address
    wants: string
  } | null>(null)
  const [lastQuote, setLastQuote] =
    useState<MarketOrderSimulationResult | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [pathId, setPathId] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (chainIdConnected) {
      setChainId(chainIdConnected)
    }
  }, [chainIdConnected])

  const tokenListQuery = useQuery({
    queryKey: ["odosTokenList", chainId],
    queryFn: async () => {
      const response = await fetch(
        ODOS_API_URL + ODOS_API_ROUTES.TOKEN_LIST(chainId),
      )
      const data: any = await response.json()

      const tokenMap = data.tokenMap
      const addresses = Object.keys(tokenMap)
      const tokenInfo = addresses.map((address: string) => tokenMap[address])
      return tokenInfo
        .map((token: any, index: number) => ({
          address: addresses[index] as `0x${string}`,
          symbol: token.symbol,
          decimals: token.decimals,
          displayDecimals: 4,
          priceDisplayDecimals: 2,
          mgvTestToken: false,
        }))
        .filter(
          (token: any) =>
            token.address !== "0x0000000000000000000000000000000000000000",
        )
    },
    refetchInterval: 24 * 60 * 60 * 1000,
  })

  const routerContractQuery = useQuery({
    queryKey: ["odosRouterContract", chainId],
    queryFn: async () => {
      const response = await fetch(
        ODOS_API_URL + ODOS_API_ROUTES.ROUTER_CONTRACT(chainId),
      )
      const data: any = await response.json()
      return data.address as Address
    },
    enabled: !!chainId,
  })

  const getQuote = async (
    params: QuoteParams,
  ): Promise<MarketOrderSimulationResult> => {
    try {
      setLoadingQuote(true)
      setLastRequest({
        tokenToSell: params.inputTokens[0]!.tokenAddress,
        tokenToBuy: params.outputTokens[0]!.tokenAddress,
        wants: params.inputTokens[0]!.amount,
      })
      const chainId = params.chainId ?? DEFAULT_ODOS_CHAIN_ID
      const response = await fetch(ODOS_API_URL + ODOS_API_ROUTES.QUOTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...params, chainId }),
      })
      const odosQuote: any = await response.json()

      const quote: MarketOrderSimulationResult = {
        baseAmount: BigInt(odosQuote.inAmounts[0]),
        quoteAmount: BigInt(odosQuote.outAmounts[0]),
        gas: BigInt(odosQuote.gasEstimate),
        feePaid: BigInt(0),
        maxTickEncountered: BigInt(0),
        minSlippage: odosQuote.priceImpact * -1,
        fillWants: true,
        rawPrice: Number(odosQuote.netOutValue) || 0,
        fillVolume: BigInt(odosQuote.outAmounts[0]),
      }

      setLastQuote(quote)
      setPathId(odosQuote.pathId)
      return quote
    } catch (error) {
      console.error("Error getting quote", error)
      throw error
    } finally {
      setLoadingQuote(false)
    }
  }

  const getAssembledTransactionOfLastQuote =
    async (): Promise<AssembledTransaction> => {
      const response = await fetch(ODOS_API_URL + ODOS_API_ROUTES.ASSEMBLE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathId,
          userAddr,
        }),
      })
      const data: any = await response.json()

      return data.transaction as AssembledTransaction
    }

  const executeOdosTransaction = async (params: AssembledTransaction) => {
    try {
      if (
        !walletClient ||
        !publicClient ||
        !pathId ||
        !userAddr ||
        !lastRequest ||
        !tokenListQuery.data ||
        !lastQuote
      )
        throw new Error("Missing required parameters for Odos transaction")

      const hash = await walletClient.sendTransaction({
        to: params.to as Address,
        data: params.data as `0x${string}`,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      const baseToken = getTokenByAddressOdos(
        lastRequest.tokenToSell,
        tokenListQuery.data,
      )!
      const quoteToken = getTokenByAddressOdos(
        lastRequest.tokenToBuy,
        tokenListQuery.data,
      )!
      successToast(
        TradeMode.MARKET,
        BS.sell,
        baseToken,
        quoteToken,
        lastRequest.wants,
        {
          bounty: BigInt(0),
          feePaid: BigInt(0),
          takerGot: lastQuote.quoteAmount,
          takerGave: lastQuote.baseAmount,
        },
        quoteToken,
        baseToken,
      )
      return receipt
    } catch (error) {
      console.error("Error executing Odos transaction:", error)
      toast.error("Failed to execute swap")
      throw error
    }
  }

  const hasToApproveOdos = async (params: {
    address: Address
    amount: bigint
  }) => {
    const { address, amount } = params
    const allowance = await publicClient?.readContract({
      address,
      functionName: "allowance",
      args: [userAddr as Address, routerContractQuery.data as Address],
      abi: erc20Abi,
    })

    if (allowance === undefined) throw new Error("Could not get allowance")

    return allowance < amount
  }

  return {
    odosTokens: tokenListQuery.data ?? [],
    odosRouterContractAddress: routerContractQuery.data,
    getAssembledTransactionOfLastQuote,
    executeOdosTransaction,
    hasToApproveOdos,
    isOdosLoading:
      tokenListQuery.isLoading || routerContractQuery.isLoading || loadingQuote,
    error: tokenListQuery.error,
    getQuote,
  }
}
