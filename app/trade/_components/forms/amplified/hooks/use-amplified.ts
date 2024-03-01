/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { Token } from "@mangrovedao/mangrove.js"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import Big from "big.js"
import React from "react"
import { useEventListener } from "usehooks-ts"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import type { Form } from "../types"

type Props = {
  onSubmit?: (data: Form) => void
}

export function useAmplified({ onSubmit }: Props) {
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { market, marketInfo } = useMarket()

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      sendSource: "",
      sendAmount: "",
      sendToken: "",
      assets: [
        {
          amount: "",
          token: "",
          limitPrice: "",
          receiveTo: "simple",
        },
        {
          amount: "",
          token: "",
          limitPrice: "",
          receiveTo: "simple",
        },
      ],
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
  const assets = form.useStore((state) => state.values.assets)

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

  const selectedToken = availableTokens.find(
    (token) => token.id === selectedTokenId,
  )

  // market details
  const minBid = market?.getSemibook("bids").getMinimumVolume(220_000)
  const tickSize = marketInfo?.tickSpacing
    ? `${((1.0001 ** marketInfo?.tickSpacing - 1) * 100).toFixed(2)}%`
    : ""

  const minVolume = minBid?.toFixed(selectedToken?.displayedDecimals)

  const selectedSource = logics.find((logic) => logic?.id === sendSource)

  const compatibleMarkets = openMarkets?.filter(
    (market) =>
      market.base.id === selectedToken?.id ||
      market.quote.id === selectedToken?.id,
  )

  const currentTokens = availableTokens?.filter((token) => {
    if (selectedToken?.id === token.id) return false

    return compatibleMarkets?.some(
      (market) => market.base.id == token.id || market.quote.id == token.id,
    )
  })

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  const computeReceiveAmount = (index: number) => {
    const limitPrice = form.getFieldValue(`assets`)[index]?.limitPrice
    const assets = form.getFieldValue(`assets`)
    if (!limitPrice || !assets) return

    for (let i = 0; i < assets.length; i++) {
      const amount = Big(!isNaN(Number(sendAmount)) ? Number(sendAmount) : 0)
        .div(
          Big(
            !isNaN(Number(limitPrice)) && Number(limitPrice) > 0
              ? Number(limitPrice)
              : 1,
          ),
        )
        .toString()

      // form.store.setState(
      //   (state) => {
      //     return {
      //       ...state,
      //       values: {
      //         ...state.values,
      //         assets: [...assets, { ...assets[i], limitPrice, amount }],
      //       },
      //     }
      //   },
      //   {
      //     priority: "high",
      //   },
      // )
    }
  }

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    const assets = form.getFieldValue(`assets`)

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      if (!asset) return
      if (asset.token === market?.quote.id) {
        form.store.setState(
          (state) => {
            return {
              ...state,
              values: {
                ...state.values,
                assets: [
                  ...assets,
                  { ...asset, limitPrice: event.detail.price },
                ],
              },
            }
          },
          {
            priority: "high",
          },
        )

        form.validateAllFields("blur")
        if (sendAmount === "") return
      }
    }

    form.validateAllFields("blur")
    if (sendAmount === "") return
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  // React.useEffect(() => {}, [form])

  React.useEffect(() => {
    // form?.reset()
  }, [form])

  return {
    handleSubmit,
    computeReceiveAmount,
    form,
    market,
    sendAmount,
    sendSource,
    sendToken,
    selectedToken,
    selectedSource,
    timeInForce,

    assets,
    //market details
    tickSize,
    minVolume,

    logics,
    currentTokens,
    availableTokens,
    openMarkets,
  }
}
