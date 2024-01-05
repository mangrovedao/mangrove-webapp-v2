/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
// import { mangroveOrderConfiguration } from "@mangrovedao/mangrove.js/dist/nodejs/configuration"
import { LiquidityProvider, configuration } from "@mangrovedao/mangrove.js"

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
  order: Order
}

export function useEditOrder(props: Props) {
  const {
    offerId,
    initialGives,
    initialWants,
    price: currentPrice,
    isBid,
  } = props.order

  const { mangrove } = useMangrove()
  const { market } = useMarket()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: currentPrice,
      send: initialGives,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: isBid,
    },
  })

  const udpdateOffer = async () => {
    if (!mangrove || !market) return

    const price = form.state.values.limitPrice
    const orderLogic = mangrove.offerLogic(mangrove.orderContract.address)
    const gasreq = configuration.mangroveOrder.getRestingOrderGasreq(
      mangrove.network.name,
    )

    const orderLP = await LiquidityProvider.connect(orderLogic, gasreq, market)

    isBid
      ? await orderLP.updateBid(Number(offerId), {
          volume: initialWants,
          price,
        })
      : await orderLP.updateAsk(Number(offerId), {
          volume: initialGives,
          price,
        })
  }

  const tradeAction = isBid ? TradeAction.BUY : TradeAction.SELL
  const { quoteToken } = useTradeInfos("market", tradeAction)
  const [toggleEdit, setToggleEdit] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    udpdateOffer()
    setTimeout(() => {
      return true
    }, 50000)
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
