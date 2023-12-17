"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
// import configuration from "@mangrovedao/mangrove.js/dist/nodejs/configuration"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"

import useMarket from "@/providers/market"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useMarketForm(props: Props) {
  const { market, marketInfo } = useMarket()
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      sliderPercentage: 25,
      slippagePercentage: "0.5",
      send: "",
      receive: "",
    },
    onSubmit: (values) => props.onSubmit(values),
  })
  const [estimateFrom, setEstimateFrom] = React.useState<
    "send" | "receive" | undefined
  >()
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const send = form.useStore((state) => state.values.send)
  const receive = form.useStore((state) => state.values.receive)
  const { sendToken, receiveToken, sendTokenBalance } = useTradeInfos(
    "market",
    tradeAction,
  )

  const { data: estimatedVolume } = useQuery({
    queryKey: [
      "estimateVolume",
      market?.base.address,
      market?.quote.address,
      send,
      receive,
      tradeAction,
    ],
    queryFn: async () => {
      if (!market) return

      const amount = estimateFrom === "receive" ? send : receive

      const { estimatedVolume, estimatedFee } = await market.estimateVolume({
        given: Big(amount),
        what: estimateFrom === "receive" ? "quote" : "base",
        to: estimateFrom === "receive" ? "sell" : "buy",
      })
      estimateFrom === "receive"
        ? form.setFieldValue("receive", estimatedVolume.toString())
        : form.setFieldValue("send", estimatedVolume.toString())

      return { estimatedVolume, estimatedFee }
    },
    enabled: !!(send || receive),
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  async function computeReceiveAmount() {
    setEstimateFrom("receive")
    if (!send) return
    form.validateAllFields("submit")
  }

  async function computeSendAmount() {
    setEstimateFrom("send")
    if (!receive) return
    form.validateAllFields("submit")
  }

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
    sendToken,
    send,
    receiveToken,
    marketInfo,
    estimatedVolume: estimatedVolume?.estimatedVolume.toString(),
    estimatedFee: estimatedVolume?.estimatedFee.toString(),
  }
}
