"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Market, Token } from "@mangrovedao/mangrove.js"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"

import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

const determinePrices = (
  quoteToken?: Token,
  orderBook?: {
    asks: Market.Offer[]
    bids: Market.Offer[]
  } | null,
  marketPrice?: number,
) => {
  if (!orderBook?.bids || orderBook?.asks) {
    return {
      price: marketPrice,
      decimals: determinePriceDecimalsFromToken(marketPrice, quoteToken),
    }
  }

  const bids = orderBook?.bids
  const asks = orderBook?.asks

  // calculate average
  const allPrices = asks
    ?.map((ask) => ask.price)
    .concat(bids.map((bid) => bid.price))
  const totalSum = allPrices.reduce((total, price) => total + Number(price), 0)
  const averagePrice = totalSum / allPrices.length

  return {
    price: averagePrice,
    decimals: determinePriceDecimalsFromToken(averagePrice, quoteToken),
  }
}

export function useMarketForm(props: Props) {
  const [estimateFrom, setEstimateFrom] = React.useState<
    "send" | "receive" | undefined
  >()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      sliderPercentage: 25,
      slippage: 0.5,
      send: "",
      receive: "",
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const send = form.useStore((state) => state.values.send)
  const receive = form.useStore((state) => state.values.receive)

  const { market, marketInfo, requestBookQuery: orderBook } = useMarket()
  const {
    sendToken,
    quoteToken,
    receiveToken,
    sendTokenBalance,
    tickSize,
    feeInPercentageAsString,
    spotPrice,
  } = useTradeInfos("market", tradeAction)

  const { data: marketPrice } = useTokenPriceQuery(
    market?.base?.symbol,
    market?.quote?.symbol,
  )

  const averagePrice = determinePrices(
    quoteToken,
    orderBook.data,
    marketPrice?.close,
  )

  const { data: estimatedVolume } = useQuery({
    queryKey: [
      "estimateVolume",
      market?.base.address,
      market?.quote.address,
      send,
      receive,
      tradeAction,
      estimateFrom,
    ],
    queryFn: async () => {
      if (!market) return

      const isReceive = estimateFrom === "receive"

      const given = isReceive ? send : receive

      const what = isReceive
        ? tradeAction === TradeAction.BUY
          ? "quote"
          : "base"
        : tradeAction === TradeAction.BUY
          ? "base"
          : "quote"

      const to = isReceive ? "sell" : "buy"

      const { estimatedVolume, estimatedFee } = await market.estimateVolume({
        given,
        what,
        to,
      })

      isReceive
        ? form.setFieldValue("receive", estimatedVolume.toString())
        : form.setFieldValue("send", estimatedVolume.toString())

      form.validateAllFields("submit")
      return { estimatedVolume, estimatedFee }
    },
    enabled: !!(send || receive) && !!market,
  })

  const hasEnoughVolume =
    (Number(receive) || Number(send)) != 0 &&
    Number(estimatedVolume?.estimatedVolume) === 0

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
  }, [form, tradeAction])

  React.useEffect(() => {
    form?.reset()
  }, [form, market?.base, market?.quote])

  return {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
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
