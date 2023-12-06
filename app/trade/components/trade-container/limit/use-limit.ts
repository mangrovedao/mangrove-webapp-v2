"use client"
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"

import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../constants"
import { TradeAction } from "../types"

export function useLimit() {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      tradeAction: TradeAction.BUY,
      limitPrice: "",
      send: "",
      receive: "",
    },
    onSubmit: async ({ tradeAction, send, receive }) => {
      if (!market) return
      try {
        // DOUBLE Approval for limit order's explanation:
        /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
        const spender = await mangrove?.orderContract.router()
        if (!spender) return

        const { baseQuoteToSendReceive } =
          TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
        const [sendToken] = baseQuoteToSendReceive(market.base, market.quote)
        await sendToken.increaseApproval(spender, send)
        await market.buy({
          gives: send,
          wants: receive,
        })
        form.reset()
      } catch (e) {
        console.error(e)
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  function computeReceiveAmount() {
    const limitPrice = form.state.values.limitPrice
    const send = form.state.values.send
    if (send === "") return
    const divider = Number(limitPrice) !== 0 ? Number(limitPrice) : 1
    const receive = Big(Number(send ?? 0))
      .div(divider)
      .toString()
    form.setFieldValue("receive", receive)
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    const limitPrice = form.state.values.limitPrice
    const receive = form.state.values.receive
    if (receive === "") return
    const send = Big(Number(limitPrice ?? 0))
      .mul(Number(receive ?? 0))
      .toString()
    form.setFieldValue("send", send)
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
  }
}
