"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  MarketOrderSimulationParams,
  Token,
  marketOrderSimulation,
} from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { formatUnits, parseUnits } from "viem"

import useMarket from "@/providers/market"

import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useBook } from "@/hooks/use-book"
import useMangroveTokenPricesQuery from "@/hooks/use-mangrove-token-price-query"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { getExactWeiAmount } from "@/utils/regexp"
import { Book, CompleteOffer } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useTradeBalances } from "../../hooks/use-trade-balances"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
  bs: BS
}

const determinePrices = (
  bs: BS,
  quoteToken?: Token,
  orderBook?: { bids: CompleteOffer[]; asks: CompleteOffer[] },
  marketPrice?: number,
) => {
  // Check if orderBook is valid and has bids/asks
  if (!orderBook || !orderBook.bids || !orderBook.asks) {
    return {
      price: marketPrice,
      decimals: determinePriceDecimalsFromToken(marketPrice, quoteToken),
    }
  }

  const bids = orderBook.bids
  const asks = orderBook.asks

  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]

  const averagePrice = bs === BS.buy ? lowestAsk?.price : highestBid?.price

  return {
    price: averagePrice,
    decimals: determinePriceDecimalsFromToken(Number(averagePrice), quoteToken),
  }
}

export function useMarketForm(props: Props) {
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      bs: props.bs,
      sliderPercentage: 25,
      slippage: 1,
      send: "",
      receive: "",
      isWrapping: false,
      maxTickEncountered: 0n,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const bs = props.bs
  const send = form.useStore((state) => state.values.send)
  const receive = form.useStore((state) => state.values.receive)

  const { currentMarket: market } = useMarket()

  const { sendToken, quoteToken, receiveToken, feeInPercentageAsString } =
    useTradeInfos("market", bs)

  const { data: tradeBalances } = useTradeBalances({
    sendToken,
    receiveToken,
  })

  const { sendBalance, ethBalance } = tradeBalances || {}

  const { mergedBooks: book } = useMergedBooks()
  const { book: oldBook } = useBook()

  const { data: marketPrice } = useMangroveTokenPricesQuery(
    market?.base?.address,
    market?.quote?.address,
  )

  const averagePrice = determinePrices(
    bs,
    quoteToken,
    book,
    Number(marketPrice?.close),
  )

  const [estimateFrom, setEstimateFrom] = React.useState<
    "send" | "receive" | undefined
  >()

  const { data } = useQuery({
    queryKey: ["marketOrderSimulation", estimateFrom, bs, receive, send],
    queryFn: () => {
      if (!book) return null
      const orderbook = {
        ...book,
        asksConfig: oldBook?.asksConfig,
        bidsConfig: oldBook?.bidsConfig,
        marketConfig: oldBook?.marketConfig,
        midPrice: oldBook?.midPrice,
        spread: oldBook?.spread,
        spreadPercent: oldBook?.spreadPercent,
      }

      const baseAmount =
        bs == BS.buy
          ? parseUnits(receive, market?.base.decimals ?? 18)
          : parseUnits(send, market?.base.decimals ?? 18)

      const quoteAmount =
        bs == BS.buy
          ? parseUnits(send, market?.quote.decimals ?? 18)
          : parseUnits(receive, market?.quote.decimals ?? 18)

      const isBasePay = market?.base.address === sendToken?.address

      const params: MarketOrderSimulationParams =
        estimateFrom === "send"
          ? isBasePay
            ? {
                base: baseAmount,
                bs: BS.sell,
                book: orderbook as Book,
              }
            : {
                quote: quoteAmount,
                bs: BS.buy,
                book: orderbook as Book,
              }
          : isBasePay
            ? {
                quote: quoteAmount,
                bs: BS.buy,
                book: orderbook as Book,
              }
            : {
                base: baseAmount,
                bs: BS.sell,
                book: orderbook as Book,
              }

      const {
        baseAmount: baseEstimation,
        quoteAmount: quoteEstimation,
        maxTickEncountered,
      } = marketOrderSimulation(params)

      ////// todo: pre-fill slippage with ((maxTickEncountered-averageTick)/10000) * 1.1
      // const averageTick = tickFromVolumes(
      //   parseUnits(send, market?.base.decimals ?? 18),
      //   parseUnits(receive, market?.quote.decimals ?? 18),
      // )
      // const maxTick = maxTickEncountered
      // const slippage = (maxTick - averageTick) / 10000n
      // const formattedSlippage = Number(slippage) * 1.1

      // form.setFieldValue("slippage", formattedSlippage)
      //////

      const formattedBaseEstimation = getExactWeiAmount(
        formatUnits(baseEstimation, market?.base.decimals ?? 18),
        market?.base.displayDecimals,
      )

      const formattedQuoteEstimation = getExactWeiAmount(
        formatUnits(quoteEstimation, market?.quote.decimals ?? 18),
        market?.quote.displayDecimals,
      )

      const estimatedReceive =
        bs === BS.buy ? formattedBaseEstimation : formattedQuoteEstimation
      const estimatedSend =
        bs === BS.buy ? formattedQuoteEstimation : formattedBaseEstimation

      estimateFrom === "receive"
        ? form.setFieldValue("send", estimatedSend)
        : form.setFieldValue("receive", estimatedReceive)

      form.setFieldValue("maxTickEncountered", maxTickEncountered)

      form.validateAllFields("submit")

      return { baseEstimation, quoteEstimation, maxTickEncountered }
    },
  })

  const hasEnoughVolume =
    ((Number(receive) || Number(send)) != 0 &&
      Number(data?.baseEstimation) === 0) ||
    Number(data?.quoteEstimation) === 0

  const computeReceiveAmount = React.useCallback(() => {
    setEstimateFrom("send")
  }, [])

  const computeSendAmount = React.useCallback(() => {
    setEstimateFrom("receive")
  }, [])

  React.useEffect(() => {
    form?.reset()
  }, [market?.base?.symbol, market?.quote?.symbol])

  // Move the isWrapping hook to the top level
  const isWrapping = form.useStore((state) => state.values.isWrapping)

  // Add a function to get all form errors
  const getAllErrors = React.useCallback(() => {
    // Create a new empty object instead of spreading form.state.errors
    const errors: Record<string, string | string[]> = {}

    // Manually copy any field errors from form.state.errors if needed
    if (form.state.errors) {
      Object.entries(form.state.errors).forEach(([key, value]) => {
        if (
          typeof key === "string" &&
          !["length", "toString", "toLocaleString"].includes(key)
        ) {
          errors[key] = value as string | string[]
        }
      })
    }

    // Check for send field errors
    if (form.state.values.send) {
      const sendValue = Number(form.state.values.send)
      if (sendValue <= 0) {
        // errors.send = ""
      } else if (
        !isWrapping &&
        sendValue - 0.0000001 >
          Number(
            formatUnits(sendBalance?.balance || 0n, sendToken?.decimals ?? 18),
          )
      ) {
        errors.send = "Insufficient balance"
      }
    }

    // Check for receive field errors
    // if (form.state.values.receive === "0" && hasEnoughVolume) {
    //   errors.receive = "Insufficient volume"
    // }

    return errors
  }, [
    form.state.errors,
    form.state.values,
    isWrapping,
    sendBalance,
    sendToken,
    hasEnoughVolume,
  ])

  return {
    computeReceiveAmount,
    computeSendAmount,
    sendBalance,
    ethBalance,
    maxTickEncountered: data?.maxTickEncountered,
    form,
    market,
    sendToken,
    receiveToken,
    quote: market?.quote,
    avgPrice: averagePrice.price?.toFixed(averagePrice.decimals),
    feeInPercentageAsString,
    isWrapping,
    slippage: form.useStore((state) => state.values.slippage),
    getAllErrors,
  }
}
