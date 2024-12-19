/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { BS } from "@mangrovedao/mgv/lib"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"

import { hasExpired } from "@/utils/date"
import { useTradeInfos } from "../../../forms/hooks/use-trade-infos"
import { TimeToLiveUnit } from "../../../forms/limit/enums"
import { Order } from "../schema"
import { Form } from "../types"

type Props = {
  order: Order
  onSubmit: (data: Form) => void
}

export function useEditOrder({ order, onSubmit }: Props) {
  const {
    price: currentPrice,
    expiry,
    market,
    total,
    side,
    type,
    received,
    sent,
  } = order

  const isBid = side === "buy"
  // const logics = useLogics()
  // const findLogicByAddress = (address: string) =>
  //   logics?.find((logic) => logic.logic.toLowerCase() === address.toLowerCase())

  // const sendFrom = findLogicByAddress(outboundRoute)
  // const receiveTo = findLogicByAddress(inboundRoute)
  const quoteDecimals = market?.quote.displayDecimals
  const baseDecimals = market?.base.displayDecimals

  const volumeDecimals = isBid ? market?.quote.decimals : market?.base.decimals

  const amountDecimals = isBid ? market?.base.decimals : market?.quote.decimals

  const volume = sent.toFixed(volumeDecimals)
  const amount = total.toFixed(amountDecimals)

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: Number(currentPrice).toFixed(quoteDecimals),
      send: volume,
      receive: amount,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: isBid,
    },
    onSubmit: (values) => onSubmit(values),
  })

  function computeReceiveAmount() {
    const limit = Number(form?.getFieldValue("limitPrice") ?? 0)
    const send = Number(form?.getFieldValue("send") ?? 0)

    form.setFieldValue(
      "receive",
      (isBid ? send / limit : send * limit).toString(),
    )
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    const limit = Number(form?.getFieldValue("limitPrice") ?? 0)
    const receive = Number(form?.getFieldValue("receive") ?? 0)
    form.setFieldValue(
      "send",
      (isBid ? receive * limit : receive / limit).toString(),
    )
    form.validateAllFields("submit")
  }

  const tradeAction = isBid ? BS.buy : BS.sell
  const { sendTokenBalance } = useTradeInfos("limit", tradeAction)
  const [toggleEdit, setToggleEdit] = React.useState(false)

  const formattedPrice = `${Number(currentPrice).toFixed(
    quoteDecimals,
  )} ${market?.quote?.symbol}`

  const isOrderExpired = expiry && hasExpired(new Date(expiry * 1000))

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  React.useEffect(() => {
    form?.reset()
  }, [toggleEdit, form])

  return {
    handleSubmit,
    setToggleEdit,
    computeReceiveAmount,
    computeSendAmount,
    form,
    toggleEdit,
    isOrderExpired,
    formattedPrice,
    sendTokenBalance,
    displayDecimals: {
      volume: isBid ? quoteDecimals : baseDecimals,
      price: quoteDecimals,
    },
  }
}
