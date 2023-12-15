"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"

import useMarket from "@/providers/market"
import { TradeAction } from "../../enums"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useLimit(props: Props) {
  const { market, marketInfo } = useMarket()
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      limitPrice: "",
      send: "",
      receive: "",
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "1",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const {
    quoteToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
  } = useTradeInfos("limit", tradeAction)

  const send = form.useStore((state) => state.values.send)
  const timeInForce = form.useStore((state) => state.values.timeInForce)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  function computeReceiveAmount() {
    const limitPrice = form.state.values.limitPrice
    const send = form.state.values.send
    if (send === "") return

    let limit,
      receive = ""
    if (tradeAction === TradeAction.SELL) {
      limit = Big(Number(limitPrice) ?? 0)
      receive = limit.mul(Big(send ?? 0)).toString()
    } else {
      limit = Number(limitPrice) !== 0 ? Number(limitPrice) : 1
      receive = Big(Number(send ?? 0))
        .div(limit)
        .toString()
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
    if (receive === "") return
    let send = ""
    if (tradeAction === TradeAction.SELL) {
      send = Big(Number(receive ?? 0))
        .div(Number(limitPrice ?? 1))
        .toString()
    } else {
      send = Big(Number(limitPrice ?? 0))
        .mul(Number(receive ?? 0))
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

  return {
    tradeAction,
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    market,
    sendToken,
    send,
    receiveToken,
    tickSize: marketInfo?.tickSpacing.toString() ?? "-",
    feeInPercentageAsString,
    timeInForce,
  }
}
