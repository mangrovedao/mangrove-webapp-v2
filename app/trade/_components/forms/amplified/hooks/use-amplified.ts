/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import { useAccount } from "wagmi"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit?: (data: Form) => void
}

export function useAmplified({ onSubmit }: Props) {
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { market, marketInfo } = useMarket()
  const { address: owner } = useAccount()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      sendSource: "",
      sendAmount: "",
      sendToken: "",
      firstAsset: {
        amount: "",
        token: "",
        limitPrice: "",
        receiveTo: "simple",
      },
      secondAsset: {
        amount: "",
        token: "",
        limitPrice: "",
        receiveTo: "simple",
      },
      timeInForce: TimeInForce.GOOD_TIL_TIME,
      timeToLive: "28",
      timeToLiveUnit: TimeToLiveUnit.DAY,
    },
    onSubmit: (values) => onSubmit?.(values),
  })

  const sendAmount = form.useStore((state) => state.values.sendAmount)
  const sendToken = form.useStore((state) => state.values.sendToken)
  const sendSource = form.useStore((state) => state.values.sendSource)
  const timeInForce = form.useStore((state) => state.values.timeInForce)
  const selectedTokenId = form.useStore((state) => state.values.sendToken)

  const { data: openMarkets } = marketsInfoQuery

  const availableTokens =
    openMarkets?.reduce((acc, current) => {
      if (!acc.includes(current.base)) {
        acc.push(current.base)
      }
      if (!acc.includes(current.quote)) {
        acc.push(current.quote)
      }

      return acc
    }, [] as Token[]) ?? []

  /// GET liquidity sourcing logics ///
  const logics = mangrove ? Object.values(mangrove.logics) : []

  /// GET first asset infos ///
  const firstAsset = form.useStore((state) => state.values.firstAsset)
  const firstAssetToken = availableTokens.find(
    (token) => token.id === firstAsset.token,
  )

  /// GET second asset infos ///
  const secondAsset = form.useStore((state) => state.values.secondAsset)
  const secondAssetToken = availableTokens.find(
    (token) => token.id === secondAsset.token,
  )

  const selectedToken = availableTokens.find(
    (token) => token.id === selectedTokenId,
  )
  const selectedSource = logics.find((logic) => logic?.id === sendSource)

  const compatibleMarkets = openMarkets?.filter(
    (market) =>
      market.base.id === selectedToken?.id ||
      market.quote.id === selectedToken?.id,
  )

  const currentTokens = availableTokens?.filter((token) => {
    if (!selectedToken || selectedToken.id === token.id) return false

    return compatibleMarkets?.some(
      (market) => market.base.id == token.id || market.quote.id == token.id,
    )
  })

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    // form.setFieldValue("limitPrice", event.detail.price)
    form.validateAllFields("blur")
    if (sendAmount === "") return
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  React.useEffect(() => {
    form.validateAllFields("submit")
  }, [form])

  React.useEffect(() => {
    form?.reset()
  }, [form])

  return {
    handleSubmit,
    form,
    market,
    tickSize: marketInfo?.tickSpacing.toString(),

    sendAmount,
    sendSource,
    sendToken,

    selectedToken,
    selectedSource,

    timeInForce,
    firstAssetToken,
    secondAssetToken,
    logics,
    currentTokens,
    availableTokens,
    openMarkets,
  }
}
