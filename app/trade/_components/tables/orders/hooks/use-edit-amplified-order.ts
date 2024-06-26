/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { Logic } from "@mangrovedao/mgv"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { Address, formatUnits } from "viem"

import { useLogics, useMarkets } from "@/hooks/use-addresses"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { formatExpiryDate } from "@/utils/date"
import { TimeInForce, TimeToLiveUnit } from "../../../forms/amplified/enums"
import amplifiedLiquiditySourcing from "../../../forms/amplified/hooks/amplified-liquidity-sourcing"
import { getCurrentTokenPriceFromAddress } from "../../../forms/amplified/utils"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm, AmplifiedOrderStatus } from "../types"

type Props = {
  order: AmplifiedOrder
  onSubmit: (data: AmplifiedForm) => void
}

export function useEditAmplifiedOrder({ order, onSubmit }: Props) {
  const { offers } = order
  const markets = useMarkets()
  const logics = useLogics()

  const sendToken = useTokenFromAddress(
    offers.find((offer) => offer?.market.outbound_tkn as Address)?.market
      .outbound_tkn as Address,
  ).data

  const isClosed = offers.find((offer) => !offer?.isOpen)
  const sendFrom = logics.find(
    (logic) => logic?.logic == offers[0]?.outboundRoute,
  )

  const { sendFromBalance } = amplifiedLiquiditySourcing({
    logics: logics as Logic[],
    sendFrom: sendFrom?.name,
  })

  const sendTokenBalance = sendFromBalance?.formatted

  const gives = `${Number(
    formatUnits(
      BigInt(offers.find((offer) => offer.gives)?.gives || "0"),
      sendToken?.decimals || 4,
    ),
  ).toFixed(sendToken?.displayDecimals)}`

  // get assets infos
  const assets = offers.map((offer) => {
    const isBid = markets?.find(
      (market) => market.base.address === offer.market.inbound_tkn,
    )

    const quoteToken = getCurrentTokenPriceFromAddress(
      offer.market.inbound_tkn,
      markets,
    )

    const receiveToken = useTokenFromAddress(
      offer.market.inbound_tkn as Address,
    ).data

    const limitPrice = `${Number(offer.price).toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
    let wants

    if (isBid) {
      wants = Big(!isNaN(Number(offer.gives)) ? Number(offer.gives) : 0)
        .div(
          Big(
            !isNaN(Number(offer.price)) && Number(offer.price) > 0
              ? Number(offer.price)
              : 1,
          ),
        )
        .toString()
    } else {
      wants = Big(!isNaN(Number(offer.price)) ? Number(offer.price) : 0)
        .times(
          Big(
            !isNaN(Number(offer.gives)) && Number(offer.gives) > 0
              ? Number(offer.gives)
              : 0,
          ),
        )
        .toString()
    }

    //TODO: check this when not tired
    let receiveAmount = `${(Number(wants) / 10 ** (sendToken?.decimals ?? 1)).toFixed(receiveToken?.displayDecimals)} ${receiveToken?.symbol}`

    return {
      status: offer.isFilled
        ? "Filled"
        : offer.isFailed
          ? "Failed"
          : offer.isRetracted
            ? "Cancelled"
            : "Open",
      limitPrice,
      receiveAmount,
      token: receiveToken,
    }
  })

  const orderTimeInForce = order.expiryDate
    ? TimeInForce.GOOD_TIL_TIME
    : TimeInForce.FILL_OR_KILL

  const orderTimeToLive = formatExpiryDate(order.expiryDate).replace(/\D/g, "")

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      assets,
      send: gives,
      sendFrom: sendFrom as Logic,
      timeInForce: orderTimeInForce,
      timeToLive: orderTimeToLive,
      timeToLiveUnit: TimeToLiveUnit.DAY,
      status: isClosed
        ? AmplifiedOrderStatus.Closed
        : AmplifiedOrderStatus.Open,
    },
    onSubmit: (values) => onSubmit(values),
  })
  const send = form.useStore((state) => state.values.send)
  const timeInForce = form.useStore((state) => state.values.timeInForce)
  const timeToLiveUnit = form.useStore((state) => state.values.timeToLiveUnit)
  const timeToLive = form.useStore((state) => state.values.timeToLive)
  const status = form.useStore((state) => state.values.status)

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
    setToggleEdit,
    logics,
    form,
    toggleEdit,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    assets,
    send,
    sendFrom,
    sendToken,
    sendTokenBalance,
    status,
  }
}
