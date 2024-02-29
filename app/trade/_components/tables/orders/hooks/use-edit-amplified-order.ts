/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { Address, formatUnits } from "viem"
import { TimeToLiveUnit } from "../../../forms/amplified/enums"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm, AmplifiedOrderStatus } from "../types"

type Props = {
  order: AmplifiedOrder
  onSubmit: (data: AmplifiedForm) => void
}

export function useEditAmplifiedOrder({ order, onSubmit }: Props) {
  const { offers } = order

  const sendToken = useTokenFromAddress(
    offers.find((offer) => offer?.market.outbound_tkn as Address)?.market
      .outbound_tkn as Address,
  ).data

  const isClosed = offers.find((offer) => !offer?.isOpen)

  const limitPrice = `${Number(
    offers.find((offer) => offer?.price)?.market.inbound_tkn,
  ).toFixed(sendToken?.displayedDecimals)}`

  const gives = `${Number(
    formatUnits(
      BigInt(offers.find((offer) => offer.gives)?.gives || "0"),
      sendToken?.decimals!,
    ),
  ).toFixed(sendToken?.displayedDecimals)}`

  // get buying assets[]
  const assets = offers.map((offer) => {

    const receiveToken = useTokenFromAddress(
      offer.market.inbound_tkn as Address,
    ).data

    const limitPrice = `${(
      Number(offer.price) /
      10 ** (sendToken?.decimals ?? 1)
    ).toFixed(sendToken?.displayedDecimals)} ${sendToken?.symbol}`

    const wants = Number(offer.gives) * Number(offer.price)
    const receiveAmount = `${(Number(wants) / 10 ** (sendToken?.decimals ?? 1)).toFixed(receiveToken?.displayedDecimals)} ${receiveToken?.symbol}`

    return {
      limitPrice,
      receiveAmount,
      token: receiveToken,
    }
  })

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      limitPrice,
      assets,
      send: gives,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
      status: isClosed
        ? AmplifiedOrderStatus.Closed
        : AmplifiedOrderStatus.Open,
    },
    onSubmit: (values) => onSubmit(values),
  })

  const send = form.useStore((state) => state.values.send)
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
    form,
    setToggleEdit,
    toggleEdit,
    limitPrice,
    assets,
    send,
    sendToken,
    status,
  }
}
