/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"

import { TradeAction } from "../../../forms/enums"
import { useTradeInfos } from "../../../forms/hooks/use-trade-infos"
import { TimeToLiveUnit } from "../../../forms/limit/enums"

export type Form = {
  limitPrice: string
  send: string
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  isBid: boolean
}

type Props = {
  onSubmit: (data: Form) => void
}

export function useEditOrder(props: Props) {
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: "",
      send: "",
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: false,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const isBid = form.useStore((state) => state.values.isBid)
  const tradeAction = isBid ? TradeAction.BUY : TradeAction.SELL
  const { quoteToken } = useTradeInfos("market", tradeAction)
  const [toggleEdit, setToggleEdit] = React.useState(false)

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
  }
}
