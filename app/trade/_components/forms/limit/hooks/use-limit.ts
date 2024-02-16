/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { useAccount } from "wagmi"
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

  const [balanceLogic, setBalanceLogic] = React.useState<{
    formatted: string
    balance: number
  }>()

  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const send = form.useStore((state) => state.values.send)
  const sendFrom = form.state.values.sendFrom
  const timeInForce = form.useStore((state) => state.values.timeInForce)
  const logics = mangrove ? Object.values(mangrove.logics) : []

  const { address } = useAccount()
  const {
    quoteToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
    tickSize,
    spotPrice,
  } = useTradeInfos("limit", tradeAction)

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  const getPossibleLogics = async (token: Token) => {
    const logics = mangrove ? Object.values(mangrove.logics) : []
    const usableLogics = logics.map(async (logic) => {
      const canUseLogic = await logic.canUseLogicFor(token)
      if (canUseLogic) {
        return logic
      }
    })

    return usableLogics
  }

  const getLogicBalance = async (token: Token, fundOwner: string) => {
    if (sendFrom === "simple") return

    const selectedLogic = logics.find(
      (logic) => logic.id === sendFrom,
    ) as SimpleAaveLogic

    const logicToken = await selectedLogic.overlying(token)

    const logicBalance = await selectedLogic.logic.balanceLogic(
      logicToken.address,
      fundOwner,
    )

    setBalanceLogic({
      formatted: logicBalance.toNumber().toFixed(4),
      balance: logicBalance.toNumber(),
    })
  }

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

  // React.useEffect(() => {
  //   if (!sendToken || !address) return
  //   getLogicBalance(sendToken, address)
  // }, [sendToken, sendFrom])

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
    sendTokenBalance:
      sendFrom != "simple" ? { ...balanceLogic } : sendTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    market,
    sendToken,
    send,
    sendFrom,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    spotPrice,
    timeInForce,
    balanceLogic,
    logics,
  }
}
