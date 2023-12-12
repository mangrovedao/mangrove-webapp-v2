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
        // tradeAction === TradeAction.BUY
        // ? reactionToken.mgvToken
        // : actionToken.mgvToken

        // DOUBLE Approval for limit order's explanation:
        /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
        const isBuy = tradeAction === TradeAction.BUY
        const spender = mangrove?.address
        if (!spender) return

        const { baseQuoteToSendReceive } =
          TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
        const [sendToken, receiveToken] = baseQuoteToSendReceive(
          market.base,
          market.quote,
        )

        const sendToFixed = Big(send).toFixed(sendToken.decimals)
        const valuePlusSlippageAndSomeExtra = Big(sendToFixed)
          .mul(100 + slippagePercentage)
          .div(100)

        const receiveToFixed = Big(receive).toFixed(receiveToken.decimals)
        await sendToken.approve(spender, valuePlusSlippageAndSomeExtra)

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
  const baseToken = market?.base
  const quoteToken = market?.quote

  const { baseQuoteToSendReceive } =
    TRADEMODE_AND_ACTION_PRESENTATION.market[tradeAction]
  const [sendToken, receiveToken] = baseQuoteToSendReceive(
    baseToken,
    quoteToken,
  )

  const sendTokenBalance = useTokenBalance(sendToken)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  async function computeReceiveAmount() {
    const send = form.state.values.send
    if (!send) return
    // const estimatedVolume = await market?.estimateVolume({
    //   given: Big(send),
    //   what: "base",
    //   to: tradeAction,
    // })

    const estimatedVolume = await market?.estimateVolumeToReceive({
      given: Big(send),
      what: "quote",
    })

    console.log(JSON.stringify(estimatedVolume))

    form.store.setState(
      (state) => {
        return {
          ...state,
          values: {
            ...state.values,
            receive: estimatedVolume?.estimatedVolume.toString() || "",
          },
        }
      },
      {
        priority: "high",
      },
    )
    form.validateAllFields("submit")
  }

  async function computeSendAmount() {
    const receive = form.state.values.receive
    if (!receive) return
    // const estimatedVolume = await market?.estimateVolume({
    //   given: Big(receive),
    //   what: "quote",
    //   to: tradeAction,
    // })
    const estimatedVolume = await market?.estimateVolumeToSpend({
      given: Big(receive),
      what: "base",
    })

    console.log(JSON.stringify(estimatedVolume))

    form.store.setState(
      (state) => {
        return {
          ...state,
          values: {
            ...state.values,
            send: estimatedVolume?.estimatedVolume.toString() || "",
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
    market,
    sendToken,
    send,
    receiveToken,
    marketInfo,
    feeInPercentageAsString: "2",
  }
}
