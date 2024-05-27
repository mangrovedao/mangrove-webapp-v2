"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Token, marketOrderSimulation } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { parseUnits } from "viem"

import { useBook } from "@/hooks/use-book"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market.new"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { Book } from "@mangrovedao/mgv"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

const determinePrices = (
  bs: BS,
  quoteToken?: Token,
  orderBook?: Book,
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
      bs: BS.buy,
      sliderPercentage: 25,
      slippage: 0.5,
      send: "",
      receive: "",
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const bs = form.useStore((state) => state.values.bs)
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
  const { data: marketPrice } = useTokenPriceQuery(
    market?.base?.symbol,
    market?.quote?.symbol,
  )

  const averagePrice = determinePrices(bs, quoteToken, book, marketPrice?.close)
  const [estimateFrom, setEstimateFrom] = React.useState<
    "send" | "receive" | undefined
  >()

  const baseAmount =
    bs == BS.buy
      ? parseUnits(receive, market?.base.decimals ?? 18)
      : parseUnits(send, market?.quote.decimals ?? 18)

  const quoteAmount =
    bs == BS.buy
      ? parseUnits(send, market?.quote.decimals ?? 18)
      : parseUnits(receive, market?.base.decimals ?? 18)

  const {
    baseAmount: baseEstimation,
    quoteAmount: quoteEstimation,
    gas,
    feePaid,
    maxTickEncountered,
    minSlippage,
    fillWants,
  } = marketOrderSimulation({
    book: book as Book,
    bs,
    base:
      (bs === BS.buy && estimateFrom === "receive") ||
      (bs === BS.sell && estimateFrom === "send")
        ? baseAmount
        : 0n,
    quote:
      (bs === BS.buy && estimateFrom === "send") ||
      (bs === BS.sell && estimateFrom === "receive")
        ? quoteAmount
        : 0n,
  })

  const hasEnoughVolume =
    (Number(receive) || Number(send)) != 0 &&
    Number(baseEstimation || quoteEstimation) === 0

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  const computeReceiveAmount = React.useCallback(() => {
    setEstimateFrom("receive")
  }, [])

  const computeSendAmount = React.useCallback(() => {
    setEstimateFrom("send")
  }, [])

  React.useEffect(() => {
    const send = form?.getFieldValue("send")
    const receive = form?.getFieldValue("receive")
    if (!(send && receive)) return
    form.setFieldValue("send", receive)
    form.setFieldValue("receive", send)
    form.validateAllFields("submit")
  }, [form, bs])

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
    spotPrice,
  }
}
