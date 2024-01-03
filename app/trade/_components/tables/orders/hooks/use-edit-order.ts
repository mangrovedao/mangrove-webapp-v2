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
import { Order } from "../schema"

export type Form = {
  limitPrice: string
  send: string
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  isBid: boolean
}

type Props = {
  onSubmit: (data: Form) => void
  order: Order
}

export function useEditOrder(props: Props) {
  const { order } = props
  const { mangrove } = useMangrove()
  const { market } = useMarket()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: order.price,
      send: order.initialGives,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: order.isBid,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const price = form.state.values.limitPrice

  const updateAsk = async () => {
    if (!mangrove || !market) return
    const directLP = await mangrove?.liquidityProvider(market)

    console.log("ask", Number(order.offerId), {
      volume: order.initialGives,
      price,
    })

    await directLP.updateAsk(Number(order.offerId), {
      volume: order.initialGives,
      price,
    })
  }

  const updateBid = async () => {
    if (!mangrove || !market) return
    const directLP = await mangrove?.liquidityProvider(market)

    console.log("bid", Number(order.offerId), {
      volume: order.initialWants,
      price,
    })

    await directLP.updateBid(Number(order.offerId), {
      volume: order.initialWants,
      price,
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
    console.log(order)
    order.isBid ? updateBid() : updateAsk()
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
