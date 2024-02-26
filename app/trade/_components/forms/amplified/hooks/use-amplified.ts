/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useAmplified(props: Props) {
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { market, marketInfo } = useMarket()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      sendSource: "",
      sendAmount: "",
      sendToken: "",
      firstAsset: {
        amount: "",
        token: "",
        limitPrice: "",
        receiveTo: "simple",
      },
      secondAsset: {
        amount: "",
        token: "",
        limitPrice: "",
        receiveTo: "simple",
      },
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const selectedTokenId = form.useStore((state) => state.values.sendToken)
  const sendSource = form.useStore((state) => state.values.sendSource)
  const logics = mangrove ? Object.values(mangrove.logics) : []

  const sources = mangrove?.getLogicsList() ?? []
  const { data: openMarkets } = marketsInfoQuery

  const availableTokens =
    openMarkets?.reduce((acc, current) => {
      if (!acc.includes(current.base)) {
        acc.push(current.base)
      }
      if (!acc.includes(current.quote)) {
        acc.push(current.quote)
      }

      return acc
    }, [] as Token[]) ?? []

  const selectedToken = availableTokens.find(
    (token) => token.id === selectedTokenId,
  )

  const compatibleMarkets = openMarkets?.filter(
    (market) =>
      market.base.id === selectedToken?.id ||
      market.quote.id === selectedToken?.id,
  )
  const currentTokens = availableTokens?.filter((token) => {
    if (!selectedToken || selectedToken.id === token.id) return false

    return compatibleMarkets?.some(
      (market) => market.base.id == token.id || market.quote.id == token.id,
    )
  })

  const {
    quoteToken,
    baseToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
  } = useTradeInfos("amplified", tradeAction)
  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  const send = form.useStore((state) => state.values.sendAmount)
  const timeInForce = form.useStore((state) => state.values.timeInForce)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    // form.setFieldValue("limitPrice", event.detail.price)
    form.validateAllFields("blur")
    if (send === "") return
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  React.useEffect(() => {
    form.validateAllFields("submit")
  }, [form, tradeAction])

  React.useEffect(() => {
    form?.reset()
  }, [form, market?.base, market?.quote])

  return {
    tradeAction,
    sendTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    baseToken,
    market,
    sendToken,
    send,
    receiveToken,
    tickSize: marketInfo?.tickSpacing.toString(),
    feeInPercentageAsString,
    timeInForce,

    logics,
    sendSource,
    selectedToken,
    currentTokens,
    availableTokens,
    openMarkets,
    sources,
  }
}
