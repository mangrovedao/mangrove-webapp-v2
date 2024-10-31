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

import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market"

import useMangroveTokenPricesQuery from "@/hooks/use-mangrove-token-price-query"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { Book } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
  bs: BS
}

const determinePrices = (
  bs: BS,
  quoteToken?: Token,
  orderBook?: Book | null,
  marketPrice?: number,
) => {
  if (!orderBook?.bids || !orderBook?.asks) {
    return {
      price: marketPrice,
      decimals: determinePriceDecimalsFromToken(marketPrice, quoteToken),
    }
  }

  const bids = orderBook?.bids
  const asks = orderBook?.asks

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
      slippage: 0.5,
      send: "",
      receive: "",
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const bs = props.bs
  const send = form.useStore((state) => state.values.send)
  const receive = form.useStore((state) => state.values.receive)

  const { currentMarket: market } = useMarket()
  const {
    sendToken,
    quoteToken,
    receiveToken,
    sendTokenBalance,
    receiveTokenBalance,
    tickSize,
    feeInPercentageAsString,
    spotPrice,
  } = useTradeInfos("market", bs)

  const { book } = useBook()

  const { data: marketPrice, isLoading: mangroveTokenPriceLoading } =
    useMangroveTokenPricesQuery(market?.base?.address, market?.quote?.address)

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
                book,
              }
            : {
                quote: quoteAmount,
                bs: BS.buy,
                book,
              }
          : isBasePay
            ? {
                quote: quoteAmount,
                bs: BS.buy,
                book,
              }
            : {
                base: baseAmount,
                bs: BS.sell,
                book,
              }

      const { baseAmount: baseEstimation, quoteAmount: quoteEstimation } =
        marketOrderSimulation(params)

      const formattedBaseEstimation = formatUnits(
        baseEstimation,
        market?.base.decimals ?? 18,
      )
      const formattedQuoteEstimation = formatUnits(
        quoteEstimation,
        market?.quote.decimals ?? 18,
      )

      const estimatedReceive =
        bs === BS.buy ? formattedBaseEstimation : formattedQuoteEstimation
      const estimatedSend =
        bs === BS.buy ? formattedQuoteEstimation : formattedBaseEstimation
      estimateFrom === "receive"
        ? form.setFieldValue("send", estimatedSend)
        : form.setFieldValue("receive", estimatedReceive)

      form.validateAllFields("submit")

      return { baseEstimation, quoteEstimation }
    },
  })

  const hasEnoughVolume =
    ((Number(receive) || Number(send)) != 0 &&
      Number(data?.baseEstimation) === 0) ||
    Number(data?.quoteEstimation) === 0

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  const computeReceiveAmount = React.useCallback(() => {
    setEstimateFrom("send")
  }, [])

  const computeSendAmount = React.useCallback(() => {
    setEstimateFrom("receive")
  }, [])

  React.useEffect(() => {
    form?.reset()
  }, [form, market?.base, market?.quote])

  return {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    receiveTokenBalance,
    handleSubmit,
    form,
    market,
    avgPrice: averagePrice.price?.toFixed(averagePrice.decimals),
    sendToken,
    send,
    quote: market?.quote,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    hasEnoughVolume,
    slippage: form.useStore((state) => state.values.slippage),
    spotPrice,
  }
}
