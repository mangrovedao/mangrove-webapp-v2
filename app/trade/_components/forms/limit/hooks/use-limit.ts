/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { BS, getDefaultLimitOrderGasreq, minVolume } from "@mangrovedao/mgv/lib"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useTokenLogics } from "@/hooks/use-balances"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market"
import { getExactWeiAmount } from "@/utils/regexp"
import { useTradeBalances } from "../../hooks/use-trade-balances"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit: (data: Form) => void
  bs: BS
}

export function useLimit(props: Props) {
  const { address } = useAccount()

  const { currentMarket } = useMarket()
  const bs = props.bs
  const { spotPrice } = useMergedBooks()
  const sendToken = bs === BS.buy ? currentMarket?.quote : currentMarket?.base

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      bs: props.bs,
      limitPrice:
        getExactWeiAmount(spotPrice.toString(), sendToken?.displayDecimals) ??
        "",
      send: "",
      sendFrom: "simple",
      isWrapping: false,
      receive: "",
      receiveTo: "simple",
      timeInForce: TimeInForce.GTC,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => props.onSubmit(values),
  })

  const { book } = useBook()

  const isWrapping = form.useStore((state) => state.values.isWrapping)

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

  const { data: tradeBalances } = useTradeBalances({
    sendToken,
    receiveToken,
  })

  const {
    sendBalance,
    sendBalanceFormatted,
    receiveBalanceFormatted,
    ethBalance,
  } = tradeBalances || {}

  const sendBalanceWithEth = isWrapping
    ? Number(sendBalanceFormatted) +
      Number(formatUnits(ethBalance?.value ?? 0n, ethBalance?.decimals ?? 18))
    : Number(sendBalanceFormatted)

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

  const minAsk = book?.asksConfig ? minVolume(book.asksConfig, gasreq) : 0n
  const minBid = book?.bidsConfig ? minVolume(book.bidsConfig, gasreq) : 0n

  const minComputedVolume = bs === BS.buy ? minBid : minAsk
  const minVolumeFormatted = formatUnits(
    minComputedVolume,
    sendToken?.decimals || 18,
  )

  const minVolumeFormattedWithDecimals = getExactWeiAmount(
    minVolumeFormatted,
    sendToken?.displayDecimals,
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

  function computeReceiveAmount() {
    if (!currentMarket || !form) return

    try {
      const limit = Number(form.getFieldValue("limitPrice") ?? 0)
      const send = Number(form.getFieldValue("send") ?? 0)

      // Set field even when value is 0, to reflect 0 change value
      form.setFieldValue(
        "receive",
        (bs === BS.buy ? send / limit : send * limit).toFixed(
          receiveToken?.priceDisplayDecimals || 8,
        ),
      )

      // Don't call validateAllFields here
    } catch (error) {
      console.error("Error in computeReceiveAmount:", error)
    }
  }

  function computeSendAmount() {
    if (!currentMarket || !form) return

    try {
      const limit = Number(form.getFieldValue("limitPrice") ?? 0)
      const receive = Number(form.getFieldValue("receive") ?? 0)

      // Only set the send value if we have valid inputs
      if (limit > 0 && receive > 0) {
        form.setFieldValue(
          "send",
          (bs === BS.buy ? receive * limit : receive / limit).toFixed(
            sendToken?.priceDisplayDecimals || 8,
          ),
        )
      }

      // Don't call validateAllFields here
    } catch (error) {
      console.error("Error in computeSendAmount:", error)
    }
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
  }, [form, bs])

  React.useEffect(() => {
    if (!form || !sendToken || !book || !spotPrice) return

    if (form.getFieldValue("limitPrice")) return

    const amount = getExactWeiAmount(
      spotPrice.toString(),
      sendToken.displayDecimals,
    )
    form.setFieldValue("limitPrice", amount)

    setTimeout(() => form.validateAllFields("blur"), 0)
  }, [
    bs,
    form,
    sendToken,
    spotPrice,
    book,
    currentMarket?.base.address.toString(),
    currentMarket?.quote.address.toString(),
  ])

  // Add a function to get all form errors
  const getAllErrors = React.useCallback(() => {
    // Create a new empty object instead of spreading form.state.errors
    const errors: Record<string, string | string[]> = {}

    // Manually copy any field errors from form.state.errors if needed
    if (form.state.errors) {
      Object.entries(form.state.errors).forEach(([key, value]) => {
        if (
          typeof key === "string" &&
          !["length", "toString", "toLocaleString"].includes(key)
        ) {
          errors[key] = value as string | string[]
        }
      })
    }

    // Check for send field errors
    if (form.state.values.send) {
      const sendValue = Number(form.state.values.send)
      if (sendValue <= 0) {
        errors.send = "Pay amount required"
      } else if (
        !isWrapping &&
        sendValue - 0.0000001 >
          Number(
            formatUnits(sendBalance?.balance || 0n, sendToken?.decimals ?? 18),
          )
      ) {
        errors.send = "Insufficient balance"
      } else if (
        Number(minVolumeFormatted) > 0 &&
        sendValue < Number(minVolumeFormatted)
      ) {
        errors.send = `Minimum volume is ${minVolumeFormattedWithDecimals} ${sendToken?.symbol}`
      }
    }

    // Check for receive field errors
    if (form.state.values.receive && Number(form.state.values.receive) <= 0) {
      errors.receive = "Amount must be greater than 0"
    }

    // Check for limit price errors
    if (
      form.state.values.limitPrice &&
      Number(form.state.values.limitPrice) <= 0
    ) {
      errors.limitPrice = "Price must be greater than 0"
    }

    return errors
  }, [
    form.state.errors,
    form.state.values,
    isWrapping,
    sendBalance,
    sendToken,
    minVolumeFormatted,
  ])

  return {
    computeReceiveAmount,
    computeSendAmount,
    sendBalance,
    form,
    sendToken,
    receiveToken,
    quoteToken,
    receiveBalanceFormatted,
    minVolumeFormatted,
    isWrapping,
    sendBalanceWithEth,
    ethBalance,
    getAllErrors,
  }
}
