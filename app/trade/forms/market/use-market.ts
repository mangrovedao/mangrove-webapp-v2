"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type Market } from "@mangrovedao/mangrove.js"
// import configuration from "@mangrovedao/mangrove.js/dist/nodejs/configuration"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { toast } from "sonner"

import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../constants"
import { TradeAction } from "../enums"
import { handleOrderResultToastMessages } from "./utils"

export function useLimit() {
  const { mangrove } = useMangrove()
  const { market, marketInfo } = useMarket()
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      sliderPercentage: 25,
      slippagePercentage: "0.5",
      send: "",
      receive: "",
    },
    onSubmit: async (values) => {
      const {
        tradeAction,
        sliderPercentage,
        slippagePercentage,
        send,
        receive,
      } = values
      if (!mangrove || !market) return
      try {
        // DOUBLE Approval for limit order's explanation:
        /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
        const spender = await mangrove?.orderContract.router()
        if (!spender) return
        const { baseQuoteToSendReceive } =
          TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
        const [sendToken, receiveToken] = baseQuoteToSendReceive(
          market.base,
          market.quote,
        )
        const sendToFixed = Big(send).toFixed(sendToken.decimals)
        const receiveToFixed = Big(receive).toFixed(receiveToken.decimals)
        await sendToken.increaseApproval(spender, sendToFixed)
        const isBuy = tradeAction === TradeAction.BUY
        let orderParams: Market.TradeParams = {
          wants: receiveToFixed,
          gives: sendToFixed,
        }

        orderParams = {
          ...orderParams,
          forceRoutingToMangroveOrder: true,
          fillOrKill: false,
        }

        const order = isBuy
          ? await market.buy(orderParams)
          : await market.sell(orderParams)
        const orderResult = await order.result
        handleOrderResultToastMessages(orderResult, tradeAction, market)
        form.reset()
      } catch (e) {
        console.error(e)
        toast.error("An error occurred")
      }
    },
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const send = form.useStore((state) => state.values.send)
  const base = market?.base
  const quote = market?.quote
  const { baseQuoteToSendReceive } =
    TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
  const [sendToken, receiveToken] = baseQuoteToSendReceive(base, quote)
  const sendTokenBalance = useTokenBalance(sendToken)
  const fee =
    (tradeAction === TradeAction.BUY
      ? marketInfo?.asksConfig?.fee
      : marketInfo?.bidsConfig?.fee) ?? 0
  const feeInPercentageAsString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(fee / 10_000)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  function computeReceiveAmount() {
    const limitPrice = 1
    const send = form.state.values.send
    if (send === "") return
    const divider = Number(limitPrice) !== 0 ? Number(limitPrice) : 1
    const receive = Big(Number(send ?? 0))
      .div(divider)
      .toString()
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
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    const limitPrice = 1
    const receive = form.state.values.receive
    if (receive === "") return
    const send = Big(Number(limitPrice ?? 0))
      .mul(Number(receive ?? 0))
      .toString()
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
    form.validateAllFields("submit")
  }

  React.useEffect(() => {
    form?.reset()
  }, [form, market?.base, market?.quote])

  return {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    quote,
    market,
    sendToken,
    send,
    receiveToken,
    marketInfo,
    feeInPercentageAsString,
  }
}
