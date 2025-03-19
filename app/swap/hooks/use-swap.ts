import {
  CompleteOffer,
  marketOrderSimulation,
  publicMarketActions,
  type Token,
} from "@mangrovedao/mgv"
import { BS, type MarketOrderSimulationParams } from "@mangrovedao/mgv/lib"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import React from "react"
import { Address, formatUnits, parseEther, parseUnits } from "viem"
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi"

import { useMangroveAddresses, useMarkets } from "@/hooks/use-addresses"
import { useTokenBalance } from "@/hooks/use-token-balance"
// import { useTokenByAddress } from "../../../hooks/use-token-by-address";
import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import { usePostMarketOrder } from "@/app/trade/_components/forms/market/hooks/use-post-market-order"
import { useOdos } from "@/hooks/odos/use-odos"
import { useApproveToken } from "@/hooks/use-approve-token"
import { useNetworkClient } from "@/hooks/use-network-client"
import { useTokenByAddress } from "@/hooks/use-token-by-address"
import { useUniswapBook } from "@/hooks/use-uniswap-book"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { getErrorMessage } from "@/utils/errors"
import { getExactWeiAmount } from "@/utils/regexp"
import {
  deduplicateTokens,
  getAllMangroveMarketTokens,
  getMangroveTradeableTokens,
  getMarketFromTokens,
  getTradableTokens,
} from "@/utils/tokens"
import { MarketParams } from "@mangrovedao/mgv"
import { toast } from "sonner"
import { z } from "zod"

export const wethAdresses: { [key: number]: Address | undefined } = {
  168587773: "0x4200000000000000000000000000000000000023",
  81457: "0x4300000000000000000000000000000000000004",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
}

export const SLIPPAGES = ["0.1", "0.5", "1"]
const priceSchema = z.object({
  price: z.number(),
  id: z.optional(z.string()),
  symbol: z.optional(z.string()),
  name: z.optional(z.string()),
})

// Convert EnhancedOffer to a format compatible with CompleteOffer for simulation
function convertToSimulationOffers(offers: any[]): CompleteOffer[] {
  return offers.map((offer) => ({
    id: offer.id,
    price: offer.price,
    volume: offer.volume,
    offer: { prev: 0n, next: 0n, tick: 0n, gives: 0n },
    detail: { gasreq: 0n, gasprice: 0n },
  })) as CompleteOffer[]
}

export function useSwap() {
  const { isConnected, address, chainId } = useAccount()
  const { data: ethBalance } = useBalance({
    address,
  })

  const { data: uniBook } = useUniswapBook()
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

  const {
    data: wrappingHash,
    isPending: isPendingWrapping,
    sendTransaction,
  } = useSendTransaction()

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: wrappingHash,
  })

  const [showCustomInput, setShowCustomInput] = React.useState(false)
  const [slippage, setSlippage] = React.useState(SLIPPAGES[1])
  const [fields, setFields] = React.useState({
    payValue: "",
    receiveValue: "",
  })
  const [isWrapping, setIsWrapping] = React.useState(false)
  const payToken = useTokenByAddress(payTknAddress)
  const receiveToken = useTokenByAddress(receiveTknAddress)
  const payTokenBalance = useTokenBalance(payToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)
  const currentMarket = getMarketFromTokens(markets, payToken, receiveToken)
  const publicClient = useNetworkClient()
  const addresses = useMangroveAddresses()
  const approvePayToken = useApproveToken()
  const { data: spender } = useSpenderAddress("market")
  const marketClient =
    addresses && currentMarket
      ? publicClient?.extend(publicMarketActions(addresses, currentMarket))
      : undefined

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
    const payTokenDecimals = payToken?.decimals ?? 18
    const ethDecimals = ethBalance?.decimals ?? 18

    const payTokenAmount = formatUnits(
      payTokenBalance.balance ?? 0n,
      payTokenDecimals,
    )

    if (!isWrapping) {
      setFields((fields) => ({
        ...fields,
        payValue: payTokenAmount,
      }))
      return
    }

    const ethAmount = formatUnits(ethBalance?.value ?? 0n, ethDecimals)
    const totalAmount = Number(ethAmount) + Number(payTokenAmount)

    setFields((fields) => ({
      ...fields,
      payValue: getExactWeiAmount(totalAmount.toString(), payTokenDecimals),
    }))
  }

  // const getBookQuery = useQuery({
  //   queryKey: [
  //     "getBook",
  //     marketClient?.key,
  //     currentMarket?.base.address,
  //     currentMarket?.quote.address,
  //   ],
  //   queryFn: () => {
  //     if (!marketClient) return null
  //     return marketClient.getBook({
  //       depth: 50n,
  //     })
  //   },
  //   refetchInterval: 3_000,
  //   enabled: !!marketClient,
  // })

  React.useEffect(() => {
    if (wrappingHash) {
      toast.success("ETH wrapped successfully!")
      payTokenBalance.refetch()
      receiveTokenBalance.refetch()
    }
  }, [wrappingHash])

  const simulateQuery = useQuery({
    queryKey: [
      "marketOrderSimulation",
      payToken?.address,
      receiveToken?.address,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      slippage,
      fields.payValue,
      marketClient?.key,
      address,
    ],
    queryFn: async () => {
      if (!(payToken && receiveToken && isConnected)) return null

      const payAmount = parseUnits(fields.payValue, payToken.decimals)

      // Mangrove
      if (marketClient) {
        const book = uniBook
        console.log(book)
        if (!(book && address)) return null

        // Check if book is a complete Book object with required properties
        if (
          !(
            "asksConfig" in book &&
            "bidsConfig" in book &&
            "marketConfig" in book
          )
        ) {
          console.warn("Incomplete book object for market order simulation")
          return null
        }

        // Convert EnhancedOffer arrays to the format expected by marketOrderSimulation
        const simulationBook = {
          ...book,
          asks: convertToSimulationOffers(book.asks),
          bids: convertToSimulationOffers(book.bids),
        }

        const isBasePay = currentMarket?.base.address === payToken?.address
        const params: MarketOrderSimulationParams = isBasePay
          ? {
              base: payAmount,
              bs: BS.sell,
              book: simulationBook as any,
            }
          : {
              quote: payAmount,
              bs: BS.buy,
              book: simulationBook as any,
            }

        const simulation = marketOrderSimulation(params)

        const [approvalStep] = await marketClient.getMarketOrderSteps({
          bs: isBasePay ? BS.sell : BS.buy,
          user: address,
          sendAmount: payAmount,
        })

        return {
          simulation,
          approvalStep,
          receiveValue: formatUnits(
            isBasePay ? simulation.quoteAmount : simulation.baseAmount,
            receiveToken?.decimals ?? 18,
          ),
        }
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

      return {
        simulation,
        approvalStep: { done: !hasToApprove },
        receiveValue: formatUnits(
          simulation.quoteAmount,
          receiveToken?.decimals ?? 18,
        ),
      }
    },
    refetchInterval: 7_000,
    enabled:
      !!payToken &&
      !!receiveToken &&
      !!fields.payValue &&
      Number(fields.payValue) > 0 &&
      (!marketClient || (!!uniBook && !!address)),
  })

  React.useEffect(() => {
    if (simulateQuery.data?.receiveValue) {
      setFields((fields) => ({
        ...fields,
        receiveValue: simulateQuery.data?.receiveValue ?? "",
      }))
    }
  }, [simulateQuery.data?.receiveValue])

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
  const totalWrapping = React.useMemo(() => {
    if (!fields.payValue || !payToken) return 0

    const payTokenBalanceFormatted = Number(
      formatUnits(payTokenBalance.balance || 0n, payToken.decimals ?? 18),
    )
    const payValueNum = Number(fields.payValue)

    if (payValueNum <= payTokenBalanceFormatted) return 0

    return payValueNum - payTokenBalanceFormatted
  }, [fields.payValue, payToken, payTokenBalance.balance, ethBalance?.value])

  const hasEnoughBalance = React.useMemo(() => {
    if (!fields.payValue || !payToken) return false

    try {
      const availableBalance =
        isWrapping && totalWrapping > 0
          ? formatUnits(
              (payTokenBalance.balance ?? 0n) + (ethBalance?.value ?? 0n),
              payToken?.decimals ?? 18,
            )
          : formatUnits(payTokenBalance.balance ?? 0n, payToken?.decimals ?? 18)

      return Number(availableBalance) >= Number(fields.payValue)
    } catch {
      return false
    }
  }, [
    fields.payValue,
    payToken,
    payTokenBalance.balance,
    ethBalance?.value,
    totalWrapping,
    isWrapping,
  ])

  const swapButtonText = React.useMemo(() => {
    if (!hasEnoughBalance) return "Insufficient balance"
    if (fields.payValue === "") return "Enter Pay amount"
    if (Number.parseFloat(fields.payValue) <= 0)
      return "Amount must be greater than 0"
    if (approvePayToken.isPending) return "Approval in progress..."
    if (totalWrapping > 0)
      return `Wrap ${getExactWeiAmount(totalWrapping.toString(), 3)} ETH`
    if (hasToApprove) return `Approve ${payToken?.symbol}`
    if (postMarketOrder.isPending) return "Processing transaction..."
    return `Swap via ${marketClient ? "Mangrove" : "Odos"}`
  }, [
    hasEnoughBalance,
    fields.payValue,
    approvePayToken.isPending,
    totalWrapping,
    hasToApprove,
    payToken?.symbol,
    postMarketOrder.isPending,
    marketClient,
  ])

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
    postMarketOrder.isPending ||
    isPendingWrapping ||
    simulateQuery.isPending

  const isFieldLoading =
    isOdosLoading || (fields.payValue !== "" && simulateQuery.isPending)

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

    if (totalWrapping > 0) {
      sendTransaction({
        to: wethAdresses[chainId ?? 0],
        value: parseEther(totalWrapping.toString()),
      })

      return
    }

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
    isFieldLoading,
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
    isFetchingDollarValue: getMarketPriceQuery.isFetching,
    setShowCustomInput,
    setSlippage,
    isOdosLoading,
    mangroveTradeableTokensForPayToken,
    // slippage
    showCustomInput,
    slippage,
    // eth wrap
    ethBalance,
    isWrapping,
    setIsWrapping,
  }
}
