/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { useEventListener } from "usehooks-ts"

import { useLogics } from "@/hooks/use-addresses"
import { useTokenBalance, useTokenLogics } from "@/hooks/use-balances"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market.new"
import {
  BS,
  Order,
  amounts,
  getDefaultLimitOrderGasreq,
  minVolume,
} from "@mangrovedao/mgv/lib"
import { formatUnits, parseUnits } from "viem"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
}

export function useLimitOld(props: Props) {
  const { currentMarket: market } = useMarket()
  // const { currentMarket } = useMarket()
  // const { book } = useBook()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      bs: BS.buy,
      limitPrice: "",
      send: "",
      sendFrom: "simple",
      receive: "",
      receiveTo: "simple",
      orderType: Order.GTC,
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const tradeAction = form.useStore((state) => state.values.bs)
  const send = form.useStore((state) => state.values.send)
  const sendFrom = form.useStore((state) => state.values.sendFrom)
  const receiveTo = form.useStore((state) => state.values.receiveTo)

  const orderType = form.useStore((state) => state.values.orderType)
  // const logics = (
  //   mangrove
  //     ? Object.values(mangrove.logics).filter(
  //         (item) => item?.approvalType !== "ERC721",
  //       )
  //     : []
  // ) as DefaultTradeLogics[]

  // const selectedSource = logics.find((logic) => logic?.id === sendFrom)

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

  const { book } = useBook()

  const { logics: sendLogics } = useTokenLogics({ token: sendToken?.address })
  const { logics: receiveLogics } = useTokenLogics({
    token: receiveToken?.address,
  })

  const selectedSource = sendLogics.find(
    (logic) => logic.logic.name === sendFrom,
  )
  const gasreq = selectedSource?.logic.gasreq || getDefaultLimitOrderGasreq()

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
    if (tradeAction === BS.sell) {
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
    if (tradeAction === BS.sell) {
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

    form.setFieldValue("sendFrom", "simple")
    form.setFieldValue("receiveTo", "simple")

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
    orderType,
    selectedSource,
    minVolume,
  }
}

export function useLimit(props: Props) {
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      bs: BS.buy,
      limitPrice: "",
      send: "",
      sendFrom: "simple",
      receive: "",
      receiveTo: "simple",
      orderType: Order.GTC,
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const { currentMarket } = useMarket()
  const logics = useLogics()

  const bs = form.useStore((state) => state.values.bs)
  const send = form.useStore((state) => state.values.send)

  const timeInForce = form.useStore((state) => state.values.timeInForce)

  const { book } = useBook()

  const isBid = bs === BS.buy
  const sendToken = bs === BS.buy ? currentMarket?.quote : currentMarket?.base
  const receiveToken =
    bs === BS.buy ? currentMarket?.base : currentMarket?.quote
  const quoteToken = currentMarket?.quote

  const { logics: sendLogics } = useTokenLogics({ token: sendToken?.address })
  const { logics: receiveLogics } = useTokenLogics({
    token: receiveToken?.address,
  })

  // asks : sell base, buy quote
  // bids : buy base, sell quote

  const [sendFrom, receiveTo] = form.useStore((state) => [
    sendLogics.find((l) => l.logic.name === state.values.sendFrom),
    receiveLogics.find((l) => l.logic.name === state.values.receiveTo),
  ])

  const { balance: sendTokenBalance } = useTokenBalance({
    token: sendToken?.address,
    logic: sendFrom?.logic.logic,
  })

  const sendTokenBalanceFormatted = formatUnits(
    sendTokenBalance?.balance || 0n,
    sendToken?.decimals || 18,
  )

  const { balance: receiveTokenBalance } = useTokenBalance({
    token: receiveToken?.address,
    logic: receiveTo?.logic.logic,
  })

  const receiveTokenBalanceFormatted = formatUnits(
    receiveTokenBalance?.balance || 0n,
    receiveToken?.decimals || 18,
  )

  const fee = Number(
    (isBid ? book?.asksConfig?.fee : book?.bidsConfig?.fee) ?? 0,
  )

  const feeInPercentageAsString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(fee / 10_000)

  const tickSize = currentMarket?.tickSpacing
    ? `${((1.0001 ** Number(currentMarket?.tickSpacing) - 1) * 100).toFixed(2)}%`
    : ""

  const spotPrice = isBid
    ? book?.bids[0]?.price || 0
    : book?.asks[0]?.price || 0

  const [baseAmount, quoteAmount, humanPrice, sendAmount, receiveAmount] =
    form.useStore((state) => {
      const sendAmount = parseUnits(
        state.values.send,
        sendToken?.decimals || 18,
      )
      const receiveAmount = parseUnits(
        state.values.receive,
        receiveToken?.decimals || 18,
      )
      const base =
        state.values.bs === BS.buy
          ? ([receiveAmount, sendAmount] as const)
          : ([sendAmount, receiveAmount] as const)
      const humanPrice = Number(state.values.limitPrice) || 1
      return [...base, humanPrice, sendAmount, receiveAmount] as const
    })

  const gasreq = BigInt(
    Math.max(
      Number(sendFrom?.logic.gasreq || 0),
      Number(receiveTo?.logic.gasreq || 0),
      Number(getDefaultLimitOrderGasreq()),
    ),
  )

  const minAsk = book ? minVolume(book.asksConfig, gasreq) : 0n
  const minBid = book ? minVolume(book.bidsConfig, gasreq) : 0n
  const minComputedVolume = bs === BS.buy ? minBid : minAsk
  const minVolumeFormatted = formatUnits(
    minComputedVolume,
    sendToken?.decimals || 18,
  )

  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    form.setFieldValue("limitPrice", event.detail.price)
    form.validateAllFields("blur")
    if (sendAmount === 0n) return
    computeReceiveAmount()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  function computeReceiveAmount() {
    if (!currentMarket) return
    const humanPrice = Number(form.state.values.limitPrice)
    const result = amounts(
      bs === BS.buy
        ? {
            humanPrice,
            quoteAmount,
          }
        : {
            humanPrice,
            baseAmount,
          },
      currentMarket,
    )
    form.setFieldValue(
      "receive",
      formatUnits(
        bs === BS.buy ? result.baseAmount : result.quoteAmount,
        receiveToken?.decimals || 18,
      ),
    )
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    if (!currentMarket) return
    const humanPrice = Number(form.state.values.limitPrice)
    const result = amounts(
      bs === BS.buy
        ? {
            humanPrice,
            baseAmount,
          }
        : {
            humanPrice,
            quoteAmount,
          },
      currentMarket,
    )
    form.setFieldValue(
      "send",
      formatUnits(
        bs === BS.buy ? result.quoteAmount : result.baseAmount,
        sendToken?.decimals || 18,
      ),
    )
    form.validateAllFields("submit")
  }

  React.useEffect(() => {
    form?.reset()
  }, [form, currentMarket?.base, currentMarket?.quote])

  React.useEffect(() => {
    const send = form?.getFieldValue("send")
    const receive = form?.getFieldValue("receive")

    form.setFieldValue("sendFrom", "simple")
    form.setFieldValue("receiveTo", "simple")

    if (!(send && receive)) return
    form.setFieldValue("send", receive)
    form.setFieldValue("receive", send)
    form.validateAllFields("submit")
  }, [form, bs])

  React.useEffect(() => {
    const limitPrice =
      bs === BS.buy ? book?.asks[0]?.price : book?.bids[0]?.price
    if (!limitPrice) return
    form.setFieldValue(
      "limitPrice",
      limitPrice.toFixed(quoteToken?.displayDecimals),
    )
    form.validateAllFields("blur")
  }, [book?.bids[0]?.price, book?.asks[0]?.price, bs])

  return {
    form,
    timeInForce,
    sendFrom,
    send,
    receiveTo,
    sendToken,
    receiveToken,
    sendTokenBalance,
    sendTokenBalanceFormatted,
    receiveTokenBalance,
    receiveTokenBalanceFormatted,
    logics,
    sendLogics,
    spotPrice,
    receiveLogics,
    feeInPercentageAsString,
    tickSize,
    minVolume: minComputedVolume,
    minVolumeFormatted,
    computeSendAmount,
    computeReceiveAmount,
    handleSubmit,
    quoteToken,
  }
}
