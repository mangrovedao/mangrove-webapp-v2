/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
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

  const { mangrove } = useMangrove()
  const { market } = useMarket()

  const updateAsk = async () => {
    if (!mangrove || !market) return
    const directLP = mangrove?.liquidityProvider(market)

    await (
      await directLP
    ).updateAsk(1, {
      volume: 100.5,
      price: 1.00345,
    })
  }

  const updateBid = async () => {
    if (!mangrove || !market) return
    const directLP = mangrove?.liquidityProvider(market)

    await (
      await directLP
    ).updateBid(1, {
      volume: 100.5,
      price: 1.00345,
    })
  }

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
