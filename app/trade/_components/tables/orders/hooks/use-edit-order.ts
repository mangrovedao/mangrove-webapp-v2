/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"

import useMarket from "@/providers/market"
import { hasExpired } from "@/utils/date"
import { TradeAction } from "../../../forms/enums"
import { useTradeInfos } from "../../../forms/hooks/use-trade-infos"
import { TimeToLiveUnit } from "../../../forms/limit/enums"
import { Order } from "../schema"
import { Form } from "../types"

type Props = {
  order: Order
  onSettled: () => void
  onSubmit: (data: Form) => void
}

export function useEditOrder({ order, onSubmit, onSettled }: Props) {
  const { market } = useMarket()
  const {
    initialGives,
    initialWants,
    price: currentPrice,
    isBid,
    expiryDate,
  } = order

  const displayDecimals = market?.base.displayedDecimals
  const volume = Big(isBid ? initialWants : initialGives).toFixed(
    displayDecimals,
  )

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: currentPrice,
      send: volume,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: isBid,
    },
    onSubmit: (values) => onSubmit(values),
  })

  const tradeAction = isBid ? TradeAction.BUY : TradeAction.SELL
  const { quoteToken } = useTradeInfos("limit", tradeAction)
  const [toggleEdit, setToggleEdit] = React.useState(false)

  const formattedPrice = `${Number(currentPrice).toFixed(
    displayDecimals,
  )} ${market?.base?.symbol}`
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
    form,
    setToggleEdit,
    toggleEdit,
    quoteToken,
    displayDecimals,

    formattedPrice,
    isOrderExpired,
  }
}
