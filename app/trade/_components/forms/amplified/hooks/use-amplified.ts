/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMarket from "@/providers/market"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
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
      sendBalance: "",
      sendToken: "",
      buyAmount: "",
      buyToken: "",
      limitPrice: "",
      receiveTo: "",
    },
    onSubmit: (values) => props.onSubmit(values),
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const {
    quoteToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
  } = useTradeInfos("limit", tradeAction)
  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  const send = form.useStore((state) => state.values.sendBalance)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    form.setFieldValue("limitPrice", event.detail.price)
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
    market,
    sendToken,
    send,
    receiveToken,
    tickSize: marketInfo?.tickSpacing.toString(),
    feeInPercentageAsString,
  }
}
