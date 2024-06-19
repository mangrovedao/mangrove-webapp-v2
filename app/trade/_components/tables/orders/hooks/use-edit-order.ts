/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { BS } from "@mangrovedao/mgv/lib"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"

import { useLogics } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
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
  const { currentMarket: market } = useMarket()
  const {
    initialGives,
    initialWants,
    price: currentPrice,
    isBid,
    expiryDate,
    outboundRoute,
    inboundRoute,
  } = order

  const logics = useLogics()
  const findLogicByAddress = (address: string) =>
    logics?.find((logic) => logic.logic.toLowerCase() === address.toLowerCase())

  const sendFrom = findLogicByAddress(outboundRoute)
  const receiveTo = findLogicByAddress(inboundRoute)

  const baseDecimals = market?.base.displayDecimals
  const quoteDecimals = market?.quote.displayDecimals

  const volume = Big(initialGives).toFixed(quoteDecimals)
  const amount = Big(initialWants).toFixed(baseDecimals)

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

  const isOrderExpired = expiryDate && hasExpired(expiryDate)

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
    sendFrom,
    receiveTo,
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
