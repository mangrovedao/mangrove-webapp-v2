/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import useMangrove from "@/providers/mangrove"
import { Token } from "@mangrovedao/mangrove.js"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { Address, formatUnits } from "viem"

import { useTokenBalance } from "@/hooks/use-token-balance"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { TimeToLiveUnit } from "../../../forms/amplified/enums"
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

  const {
    marketsInfoQuery: { data: openMarkets },
    mangrove,
  } = useMangrove()

  const logics = mangrove ? Object.values(mangrove.logics) : []

  const sendToken = useTokenFromAddress(
    offers.find((offer) => offer?.market.outbound_tkn as Address)?.market
      .outbound_tkn as Address,
  ).data

  const isClosed = offers.find((offer) => !offer?.isOpen)
  const sendFrom = logics.find(
    (logic) => logic?.address == offers[0]?.outboundRoute,
  )
  const { sendFromBalance } = amplifiedLiquiditySourcing({
    logics,
    sendFrom: sendFrom?.id,
  })

  const { formatted } = useTokenBalance(sendToken as Token)

  const sendTokenBalance =
    sendFrom?.id === "simple" ? formatted : sendFromBalance?.formatted

  const gives = `${Number(
    formatUnits(
      BigInt(offers.find((offer) => offer.gives)?.gives || "0"),
      sendToken?.decimals || 4,
    ),
  ).toFixed(sendToken?.displayedDecimals)}`

  // get assets infos
  const assets = offers.map((offer) => {
    const isBid = openMarkets?.find(
      (market) => market.base.address === offer.market.inbound_tkn,
    )

    const quoteToken = getCurrentTokenPriceFromAddress(
      offer.market.inbound_tkn,
      openMarkets,
    )

    const receiveToken = useTokenFromAddress(
      offer.market.inbound_tkn as Address,
    ).data

    const limitPrice = `${Number(offer.price).toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`
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
    let receiveAmount = `${(Number(wants) / 10 ** (sendToken?.decimals ?? 1)).toFixed(receiveToken?.displayedDecimals)} ${receiveToken?.symbol}`

    return {
      limitPrice,
      receiveAmount,
      token: receiveToken,
    }
  })

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      assets,
      send: gives,
      sendFrom,
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
    logics,
    handleSubmit,
    form,
    setToggleEdit,
    toggleEdit,
    assets,
    send,
    sendFrom,
    sendToken,
    sendTokenBalance,
    status,
  }
}
