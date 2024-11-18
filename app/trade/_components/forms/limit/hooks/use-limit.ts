/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"

import { useLogics } from "@/hooks/use-addresses"
import { useTokenBalance, useTokenLogics } from "@/hooks/use-balances"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market"
import { BS, getDefaultLimitOrderGasreq, minVolume } from "@mangrovedao/mgv/lib"
import { formatUnits, parseUnits } from "viem"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
  bs: BS
}

export function useLimit(props: Props) {
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      bs: props.bs,
      limitPrice: "",
      send: "",
      sendFrom: "simple",
      receive: "",
      receiveTo: "simple",
      timeInForce: TimeInForce.GTC,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const { currentMarket } = useMarket()
  const logics = useLogics()

  const bs = props.bs
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
      const sendIsValid =
        !isNaN(Number(state.values.send)) && isFinite(Number(state.values.send))
      const receiveIsValid =
        !isNaN(Number(state.values.receive)) &&
        isFinite(Number(state.values.receive))

      const sendAmount = parseUnits(
        sendIsValid ? state.values.send ?? 0 : "0",
        sendToken?.decimals || 18,
      )
      const receiveAmount = parseUnits(
        receiveIsValid ? state.values.receive : "0",
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
    const limit = Number(form?.getFieldValue("limitPrice") ?? 0)
    const send = Number(form?.getFieldValue("send") ?? 0)

    form.setFieldValue(
      "receive",
      (bs === BS.buy ? send / limit : send * limit).toString(),
    )
    form.validateAllFields("submit")
  }

  function computeSendAmount() {
    if (!currentMarket) return
    const limit = Number(form?.getFieldValue("limitPrice") ?? 0)
    const receive = Number(form?.getFieldValue("receive") ?? 0)

    form.setFieldValue(
      "send",
      (bs === BS.buy ? receive * limit : receive / limit).toString(),
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

    if (!limitPrice || !form || !sendToken) return

    //what is this x)
    setTimeout(() => {
      form?.setFieldValue(
        "limitPrice",
        limitPrice.toFixed(sendToken.displayDecimals),
      )
      form?.validateAllFields("blur")
    }, 0)
  }, [bs, book?.midPrice])

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
