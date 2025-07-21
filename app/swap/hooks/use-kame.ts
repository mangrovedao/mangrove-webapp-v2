import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import {
  Api,
  FetchProviderConnector,
  GetQuoteParametersParams,
} from "@kame-ag/aggregator-sdk"
import { Address, Token as KameToken } from "@kame-ag/sdk-core"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  erc20Abi,
  formatUnits,
  maxUint256,
  parseUnits,
  TransactionReceipt,
} from "viem"
import { useChainId, usePublicClient, useWalletClient } from "wagmi"
import { TokenMetadata } from "../utils/tokens"

interface KameParams {
  payToken?: TokenMetadata
  receiveToken?: TokenMetadata
  payValue: string
  receiveValue: string
  onSwapError?: (e: any) => void
  onSwapSuccess?: (receipt: TransactionReceipt) => void
  mgvTokens: string[]
}

interface Quote {
  receive: string
  forToken: TokenMetadata
  params: GetQuoteParametersParams
}

export function useKame({
  payToken,
  receiveToken,
  payValue,
  receiveValue,
  onSwapError,
  onSwapSuccess,
  mgvTokens,
}: KameParams) {
  const aggregatorAPI = new Api({ httpConnector: new FetchProviderConnector() })
  const { data: walletClient } = useWalletClient()
  const { openMarkets: markets } = useOpenMarkets()
  const [tokenPrices, setTokenPrices] = useState<
    { quotePrice: string; basePrice: string } | undefined
  >()
  const [quote, setQuote] = useState<Quote>()
  const [fetchingQuote, setFetchingQuote] = useState<"pay" | "receive" | null>(
    null,
  )
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [swapState, setSwapState] = useState<
    "fetch-quote" | "approving" | "swapping" | null
  >(null)

  const isMgvMarket = useMemo(
    () =>
      markets.some(
        (m) =>
          m.base.address.toLowerCase() === payToken?.address.toLowerCase() &&
          m.quote.address.toLowerCase() === receiveToken?.address.toLowerCase(),
      ),
    [mgvTokens, payToken, receiveToken],
  )

  const fetchPrices = async () => {
    if (!payToken || !receiveToken) return

    const addressOverrides: Record<string, string> = {
      SEI: "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7",
    }
    payToken.address = addressOverrides[payToken.name] || payToken.address
    receiveToken.address =
      addressOverrides[receiveToken.name] || receiveToken.address

    const { priceById: prices } = await aggregatorAPI.getPrices({
      ids: [payToken.address, receiveToken.address],
    })
    const apiReceiveToken = prices[receiveToken.address]
    const apiPayToken = prices[payToken.address]

    if (!apiPayToken || !apiReceiveToken) return

    setTokenPrices({
      quotePrice: apiReceiveToken.pyxis.price,
      basePrice: apiPayToken.pyxis.price,
    })
  }

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!payToken || !receiveToken || !chainId || !fetchingQuote) {
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchPrices()

      const fetchQuote = async () => {
        const isCalculatingReceive = fetchingQuote === "receive"
        const fromToken = isCalculatingReceive ? payToken : receiveToken
        const toToken = isCalculatingReceive ? receiveToken : payToken
        const value = isCalculatingReceive ? payValue : receiveValue

        const amount = isNaN(parseFloat(value))
          ? "0"
          : parseUnits(value, fromToken.decimals).toString()

        const params = {
          fromToken: new KameToken(
            chainId,
            fromToken.address,
            fromToken.decimals,
          ),
          amount,
          toToken: new KameToken(chainId, toToken.address, toToken.decimals),
        }

        if (amount === "0") {
          setQuote({
            forToken: toToken,
            receive: "0",
            params,
          })
          setFetchingQuote(null)
          return
        }

        if (isMgvMarket) {
          //@ts-ignore
          params["includedProtocols"] = ["oxium"]
        }

        console.log("params", params)

        try {
          const _quote = await aggregatorAPI.getQuote(params)
          setQuote({
            forToken: toToken,
            receive: formatUnits(BigInt(_quote.dstAmount), toToken.decimals),
            params,
          })
        } catch (err) {
          console.error("Failed to fetch quote", err)
        } finally {
          setFetchingQuote(null)
        }
      }

      fetchQuote()
    }, 1) // 300ms debounce delay

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [payToken, receiveToken, payValue, receiveValue, chainId, fetchingQuote])

  const usdAmounts = useMemo(() => {
    if (!tokenPrices?.basePrice || !tokenPrices?.quotePrice)
      return {
        quoteUsd: 0,
        baseUsd: 0,
      }

    const { quotePrice, basePrice } = tokenPrices

    // console.log("tokenPrices", tokenPrices)

    const values = {
      quoteUsd: Number(quotePrice) * Number(receiveValue),
      baseUsd: Number(basePrice) * Number(payValue),
    }
    // console.log("values", values)
    return values
  }, [tokenPrices, fetchingQuote, receiveValue, payValue])

  const isApproved = async (spender: any) => {
    if (!walletClient || !payToken || !publicClient) return false

    const allowance = await checkAllowance(
      walletClient,
      walletClient.account.address,
      spender,
      payToken.address as `0x${string}`,
    )
    if (allowance < maxUint256) {
      const hash = await walletClient.writeContract({
        address: payToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, maxUint256],
        gas: BigInt(100_000),
      })
      const res = await publicClient.waitForTransactionReceipt({ hash })
      return res.status === "success"
    }
    return true
  }

  const swap = async (slippage: string) => {
    if (!walletClient || !quote || !publicClient || !payToken) return

    setSwapState("fetch-quote")
    try {
      const result = await aggregatorAPI.getSwap({
        ...quote.params,
        origin: new Address(walletClient?.account.address),
        tradeConfig: {
          recipient: new Address(walletClient?.account.address),
          slippage: Number(slippage) * 100,
        },
      })

      setSwapState("approving")
      const approved = await isApproved(result.tx.to)
      if (!approved) return

      setSwapState("swapping")
      const hash = await walletClient.sendTransaction({
        to: result.tx.to as `0x${string}`,
        data: result.tx.data as `0x${string}`,
        value: BigInt(result.tx.value),
      })

      const res = await publicClient.waitForTransactionReceipt({ hash })
      if (res.status === "success") {
        onSwapSuccess?.(res)
      } else {
        onSwapError?.(res)
      }
      setSwapState(null)
    } catch (e) {
      onSwapError?.(e)
      setSwapState(null)
    }
  }

  return {
    aggregatorAPI,
    usdAmounts,
    quote,
    swap,
    fetchingQuote,
    setFetchingQuote,
    swapState,
    isMgvMarket,
  }
}
