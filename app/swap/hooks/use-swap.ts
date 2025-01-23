import {
  marketOrderSimulation,
  publicMarketActions,
  type Token,
} from "@mangrovedao/mgv"
import { BS, type MarketOrderSimulationParams } from "@mangrovedao/mgv/lib"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import React from "react"
import { formatUnits, parseUnits } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { useMangroveAddresses, useMarkets } from "@/hooks/use-addresses"
import { useTokenBalance } from "@/hooks/use-token-balance"
// import { useTokenByAddress } from "../../../hooks/use-token-by-address";
import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import { usePostMarketOrder } from "@/app/trade/_components/forms/market/hooks/use-post-market-order"
import { useOdos } from "@/hooks/odos/use-odos"
import { useApproveToken } from "@/hooks/use-approve-token"
import { useTokenByAddress } from "@/hooks/use-token-by-address"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { getErrorMessage } from "@/utils/errors"
import {
  deduplicateTokens,
  getAllMangroveMarketTokens,
  getMangroveTradeableTokens,
  getMarketFromTokens,
  getTradableTokens,
} from "@/utils/tokens"
import { MarketParams } from "@mangrovedao/mgv"
import { z } from "zod"

export const SLIPPAGES = ["0.1", "0.5", "1"]
const priceSchema = z.object({
  price: z.number(),
  id: z.optional(z.string()),
  symbol: z.optional(z.string()),
  name: z.optional(z.string()),
})

export function useSwap() {
  const { isConnected, address, chainId } = useAccount()
  const { checkAndShowDisclaimer } = useDisclaimerDialog()
  const {
    getQuote,
    odosTokens,
    getAssembledTransactionOfLastQuote,
    executeOdosTransaction,
    hasToApproveOdos,
    odosRouterContractAddress,
    isOdosLoading,
  } = useOdos()
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal()
  const postMarketOrder = usePostMarketOrder()
  const markets = useMarkets()
  const [payTknAddress, setPayTknAddress] = useQueryState("payTkn", {
    defaultValue: markets[0]?.base?.address,
  })
  const [receiveTknAddress, setReceiveTknAddress] = useQueryState(
    "receiveTkn",
    {
      defaultValue: markets[0]?.quote?.address,
    },
  )

  const [showCustomInput, setShowCustomInput] = React.useState(false)
  const [slippage, setSlippage] = React.useState(SLIPPAGES[1])
  const [fields, setFields] = React.useState({
    payValue: "",
    receiveValue: "",
  })
  const payToken = useTokenByAddress(payTknAddress)
  const receiveToken = useTokenByAddress(receiveTknAddress)
  const payTokenBalance = useTokenBalance(payToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)
  const currentMarket = getMarketFromTokens(markets, payToken, receiveToken)
  const publicClient = usePublicClient()
  const addresses = useMangroveAddresses()
  const approvePayToken = useApproveToken()
  const { data: spender } = useSpenderAddress("market")
  const marketClient =
    addresses && currentMarket
      ? publicClient?.extend(publicMarketActions(addresses, currentMarket))
      : undefined

  const hasEnoughBalance =
    (payTokenBalance.balance ?? 0n) >=
    parseUnits(fields.payValue, payToken?.decimals ?? 18)

  const isReverseDisabled = !payToken || !receiveToken
  const isSwapDisabled =
    isReverseDisabled ||
    !hasEnoughBalance ||
    fields.payValue === "" ||
    fields.receiveValue === "" ||
    Number.parseFloat(fields.payValue) <= 0 ||
    Number.parseFloat(fields.receiveValue) <= 0 ||
    isOdosLoading ||
    approvePayToken.isPending ||
    postMarketOrder.isPending

  const allTokens = deduplicateTokens([
    ...getAllMangroveMarketTokens(markets),
    ...odosTokens,
  ])
  const tradableTokens = deduplicateTokens(
    getTradableTokens({
      mangroveMarkets: markets,
      odosTokens,
      token: payToken,
    }),
  )

  const [payTokenDialogOpen, setPayTokenDialogOpen] = React.useState(false)
  const [receiveTokenDialogOpen, setReceiveTokenDialogOpen] =
    React.useState(false)

  function onPayTokenSelected(token: Token) {
    const newTradableTokens = getTradableTokens({
      mangroveMarkets: markets,
      odosTokens,
      token,
    })
    setPayTknAddress(token.address)
    setPayTokenDialogOpen(false)
    setFields(() => ({
      payValue: "",
      receiveValue: "",
    }))
    if (newTradableTokens.length === 1 && newTradableTokens[0]) {
      setReceiveTknAddress(newTradableTokens[0].address)
      return
    }
    setReceiveTknAddress("")
  }

  function onReceiveTokenSelected(token: Token) {
    setReceiveTknAddress(token.address)
    setReceiveTokenDialogOpen(false)
    setFields(() => ({
      payValue: "",
      receiveValue: "",
    }))
  }

  function onMaxClicked() {
    setFields((fields) => ({
      ...fields,
      payValue: formatUnits(
        payTokenBalance.balance ?? 0n,
        payToken?.decimals ?? 18,
      ),
    }))
  }

  const getBookQuery = useQuery({
    queryKey: [
      "getBook",
      marketClient,
      currentMarket?.base.address,
      currentMarket?.quote.address,
    ],
    queryFn: () => {
      if (!marketClient) return null
      return marketClient.getBook({
        depth: 50n,
      })
    },
    refetchInterval: 3_000,
    enabled: !!marketClient,
  })

  const simulateQuery = useQuery({
    queryKey: [
      "marketOrderSimulation",
      payToken?.address,
      receiveToken?.address,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      slippage,
      fields.payValue,
      marketClient?.uid,
      address,
    ],
    queryFn: async () => {
      if (!(payToken && receiveToken && isConnected)) return null
      const payAmount = parseUnits(fields.payValue, payToken.decimals)

      // Mangrove
      if (marketClient) {
        const book = getBookQuery.data
        if (!(book && address)) return null

        const isBasePay = currentMarket?.base.address === payToken?.address
        const params: MarketOrderSimulationParams = isBasePay
          ? {
              base: payAmount,
              bs: BS.sell,
              book,
            }
          : {
              quote: payAmount,
              bs: BS.buy,
              book,
            }

        const simulation = marketOrderSimulation(params)
        setFields((fields) => ({
          ...fields,
          receiveValue: formatUnits(
            isBasePay ? simulation.quoteAmount : simulation.baseAmount,
            receiveToken?.decimals ?? 18,
          ),
        }))

        const [approvalStep] = await marketClient.getMarketOrderSteps({
          bs: isBasePay ? BS.sell : BS.buy,
          user: address,
          sendAmount: payAmount,
        })

        return { simulation, approvalStep }
      }

      // Odos
      if (!payAmount) return null

      const simulation = await getQuote({
        chainId,
        inputTokens: [
          { tokenAddress: payToken?.address, amount: payAmount.toString() },
        ],
        outputTokens: [{ tokenAddress: receiveToken?.address, proportion: 1 }],
        userAddr: address,
        slippageLimitPercent: Number(slippage),
      })

      const hasToApprove = await hasToApproveOdos({
        address: payToken?.address,
        amount: simulation.baseAmount,
      })

      setFields((fields) => ({
        ...fields,
        receiveValue: formatUnits(
          simulation.quoteAmount,
          receiveToken?.decimals ?? 18,
        ),
      }))

      return { simulation, approvalStep: { done: !hasToApprove } }
    },
    refetchInterval: 7_000,
    enabled:
      !!payToken &&
      !!receiveToken &&
      !!slippage &&
      !!fields.payValue &&
      Number(fields.payValue) > 0 &&
      (!!marketClient ? !!getBookQuery.data && !!address : true),
  })

  const getMarketPriceQuery = useQuery({
    queryKey: ["getMarketPrice", payTknAddress, receiveTknAddress],
    queryFn: async () => {
      try {
        if (!chainId || !payTknAddress || !receiveTknAddress) return null

        const payDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${payTknAddress}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        const receiveDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${receiveTknAddress}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        return {
          payDollar: payDollar.price,
          receiveDollar: receiveDollar.price,
        }
      } catch (error) {
        console.error(getErrorMessage(error))
        return { payDollar: -1, receiveDollar: -1 }
      }
    },
    refetchInterval: 3_000,
    enabled: !!markets && !!payToken && !!receiveToken,
  })

  const hasToApprove = simulateQuery.data?.approvalStep?.done === false

  const swapButtonText = !hasEnoughBalance
    ? "Insufficient balance"
    : fields.payValue === ""
      ? "Enter Pay amount"
      : Number.parseFloat(fields.payValue) <= 0
        ? "Amount must be greater than 0"
        : approvePayToken.isPending
          ? "Approval in progress..."
          : hasToApprove
            ? `Approve ${payToken?.symbol}`
            : postMarketOrder.isPending
              ? "Processing transaction..."
              : `Swap via ${marketClient ? "Mangrove" : "Odos"}`

  // slippage -> valeur en % dans marketOrderSimulation -> min slippage + petit % genre x1,1

  async function swapOdos() {
    if (!chainId || !payTknAddress || !receiveTknAddress) return

    if (hasToApprove) {
      await approvePayToken.mutate(
        {
          token: payToken,
          spender: odosRouterContractAddress,
        },
        {
          onSuccess: () => {
            simulateQuery.refetch()
          },
        },
      )
      return
    }
    const params = await getAssembledTransactionOfLastQuote()

    await executeOdosTransaction(params)

    setFields(() => ({
      payValue: "",
      receiveValue: "",
    }))
    payTokenBalance.refetch()
    receiveTokenBalance.refetch()
  }

  async function swapMangrove() {
    if (!(marketClient && address && walletClient && payToken && receiveToken))
      return

    if (hasToApprove) {
      await approvePayToken.mutate(
        {
          token: payToken,
          spender,
        },
        {
          onSuccess: () => {
            simulateQuery.refetch()
          },
        },
      )
      return
    }

    const isBasePay = currentMarket?.base.address === payToken.address

    const send = fields.payValue
    const receive = fields.receiveValue

    await postMarketOrder.mutate(
      {
        form: {
          bs: isBasePay ? BS.sell : BS.buy,
          send,
          receive,
          isWrapping: false,
          slippage: Number(slippage),
        },
        swapMarket: currentMarket as MarketParams,
        swapMarketClient: marketClient,
      },
      {
        onError: () => {},
        onSuccess: () => {
          setFields(() => ({
            payValue: "",
            receiveValue: "",
          }))
          payTokenBalance.refetch()
          receiveTokenBalance.refetch()
        },
      },
    )
  }

  async function swap() {
    if (checkAndShowDisclaimer(address)) return

    if (marketClient) {
      await swapMangrove()
    } else {
      await swapOdos()
    }
  }

  function reverseTokens() {
    setPayTknAddress(receiveTknAddress)
    setReceiveTknAddress(payTknAddress)
    setFields((fields) => ({
      payValue: fields.receiveValue,
      receiveValue: fields.payValue,
    }))
  }

  function onPayValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((fields) => ({ ...fields, payValue: e.target.value }))
  }

  function onReceiveValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((fields) => ({ ...fields, receiveValue: e.target.value }))
  }

  const mangroveTradeableTokensForPayToken = React.useMemo(() => {
    if (!payToken) return []
    return getMangroveTradeableTokens(markets, payToken).map((t) => t.address)
  }, [markets, payToken])

  return {
    payToken,
    receiveToken,
    reverseTokens,
    fields,
    onPayValueChange,
    onReceiveValueChange,
    isConnected,
    openConnectModal,
    isReverseDisabled,
    isSwapDisabled,
    swap,
    tradableTokens,
    allTokens,
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,
    onPayTokenSelected,
    onReceiveTokenSelected,
    onMaxClicked,
    swapButtonText,
    payDollar: getMarketPriceQuery.data?.payDollar ?? 0,
    receiveDollar: getMarketPriceQuery.data?.receiveDollar ?? 0,
    showCustomInput,
    slippage,
    setShowCustomInput,
    setSlippage,
    isOdosLoading,
    mangroveTradeableTokensForPayToken,
  }
}
