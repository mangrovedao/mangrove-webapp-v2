/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { toast } from "sonner"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { hasExpired } from "@/utils/date"
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
  onSettled: () => void
}

export function useEditOrder({ order, onSettled }: Props) {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const {
    offerId,
    initialGives,
    initialWants,
    price: currentPrice,
    isBid,
    expiryDate,
  } = order

  const tradeAction = isBid ? TradeAction.BUY : TradeAction.SELL
  const { quoteToken } = useTradeInfos("market", tradeAction)
  const [toggleEdit, setToggleEdit] = React.useState(false)

  const displayDecimals = market?.base.displayedDecimals

  const volume = Big(isBid ? initialWants : initialGives).toFixed(
    displayDecimals,
  )
  const formattedPrice = `${Number(currentPrice).toFixed(
    displayDecimals,
  )} ${market?.base?.symbol}`
  const isOrderExpired = expiryDate && hasExpired(expiryDate)

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice: currentPrice,
      send: volume,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      isBid: isBid,
    },
  })

  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  const udpdateOffer = async () => {
    try {
      if (!mangrove || !market) return
      const price = form.state.values.limitPrice
      const volume = form.state.values.send

      form.state.isSubmitting = true

      const updateOrder = isBid
        ? await market.updateRestingOrder("bids", {
            offerId: Number(offerId),
            volume,
            price,
          })
        : await market.updateRestingOrder("asks", {
            offerId: Number(offerId),
            volume,
            price,
          })

      // Start showing loading state indicator on parts of the UI that depend on
      startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
      const { blockNumber } = await (await updateOrder.response).wait()
      await resolveWhenBlockIsIndexed.mutateAsync({
        blockNumber,
      })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["fills"] })

      form.state.isSubmitting = false
      toast.success("Order updated successfully")

      onSettled()
    } catch (error) {
      toast.error("An error occured, please try again")
      form.state.isSubmitting = false
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void udpdateOffer()
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
