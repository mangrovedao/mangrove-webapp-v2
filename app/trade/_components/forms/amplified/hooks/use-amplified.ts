/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMarket from "@/providers/market"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useAmplified(props: Props) {
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
        receiveTo: "wallet",
      },
      secondAsset: {
        amount: "",
        token: "",
        limitPrice: "",
        receiveTo: "wallet",
      },
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
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
    assets: quoteToken && baseToken ? [quoteToken, baseToken] : [],
    tickSize: marketInfo?.tickSpacing.toString(),
    feeInPercentageAsString,
    timeInForce,
  }
}
