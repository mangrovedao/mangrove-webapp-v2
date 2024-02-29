/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useLimit(props: Props) {
  const { mangrove } = useMangrove()
  const { market, marketInfo } = useMarket()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      limitPrice: "",
      send: "",
      sendFrom: "simple",
      receive: "",
      receiveTo: "simple",
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const send = form.useStore((state) => state.values.send)
  const sendFrom = form.useStore((state) => state.values.sendFrom)
  const receiveTo = form.useStore((state) => state.values.receiveTo)

  const timeInForce = form.useStore((state) => state.values.timeInForce)
  const logics = mangrove ? Object.values(mangrove.logics) : []
  const selecteSource = logics.find((logic) => logic?.id === sendFrom)

  const {
    quoteToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
    receiveTokenBalance,
    tickSize,
    spotPrice,
    defaultLimitPrice,
  } = useTradeInfos("limit", tradeAction)

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    form.setFieldValue("limitPrice", event.detail.price)
    form.validateAllFields("blur")
    if (send === "") return
    computeReceiveAmount()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  function computeReceiveAmount() {
    const limitPrice = form.state.values.limitPrice
    const send = form.state.values.send
    const bigSend = Big(!isNaN(Number(send)) ? Number(send) : 0)
    const bigLimitPrice = Big(
      !isNaN(Number(limitPrice)) ? Number(limitPrice) : 0,
    )

    if (send === "") return

    let limit,
      receive = ""
    if (tradeAction === TradeAction.SELL) {
      limit = bigLimitPrice

      receive = limit.mul(bigSend).toString()
    } else {
      limit = Number(limitPrice) !== 0 ? Number(limitPrice) : 1
      receive = bigSend.div(limit).toString()
    }

    form.store.setState(
      (state) => {
        return {
          ...state,
          values: {
            ...state.values,
            receive,
          },
        }
      },
      {
        priority: "high",
      },
    )
    if (!(limitPrice && send)) return
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    const limitPrice = form.state.values.limitPrice
    const receive = form.state.values.receive
    const bigReceive = Big(!isNaN(Number(receive)) ? Number(receive) : 0)

    if (receive === "") return
    let send = ""
    if (tradeAction === TradeAction.SELL) {
      send = bigReceive
        .div(Big(!isNaN(Number(limitPrice)) ? Number(limitPrice) : 1))
        .toString()
    } else {
      send = Big(!isNaN(Number(limitPrice)) ? Number(limitPrice) : 0)
        .mul(bigReceive)
        .toString()
    }

    form.store.setState(
      (state) => {
        return {
          ...state,
          values: {
            ...state.values,
            send,
          },
        }
      },
      {
        priority: "high",
      },
    )
    if (!(limitPrice && receive)) return
    form.validateAllFields("submit")
  }

  React.useEffect(() => {
    const send = form?.getFieldValue("send")
    const receive = form?.getFieldValue("receive")
    if (!(send && receive)) return
    form.setFieldValue("send", receive)
    form.setFieldValue("receive", send)
    form.validateAllFields("submit")
  }, [form, tradeAction])

  React.useEffect(() => {
    form?.reset()
  }, [form, market?.base, market?.quote])

  React.useEffect(() => {
    if (!defaultLimitPrice || !form || !sendToken) return

    //what is this x)
    setTimeout(() => {
      form?.setFieldValue(
        "limitPrice",
        defaultLimitPrice.toFixed(sendToken.displayedDecimals),
      )
      form?.validateAllFields("blur")
    }, 0)
  }, [form, defaultLimitPrice])

  return {
    tradeAction,
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    receiveTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    market,
    sendToken,
    send,
    sendFrom,
    receiveTo,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    spotPrice,
    timeInForce,
    logics,
    selecteSource,
  }
}
