import React from "react"
import { useAccount } from "wagmi"

import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import { useEventListener } from "usehooks-ts"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import { Asset } from "../types"
import liquiditySourcing from "./amplified-liquidity-sourcing"
import { ChangingFrom, useNewStratStore } from "./amplified-store"

export const MIN_PRICE_POINTS = 2
export const MIN_RATIO = 1.001
export const MIN_STEP_SIZE = 1

export default function useAmplifiedForm() {
  const { address } = useAccount()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { market, marketInfo } = useMarket()

  const { data: openMarkets } = marketsInfoQuery

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    // const assets = form.getFieldValue(`assets`)
    // for (let i = 0; i < assets.length; i++) {
    //   const asset = assets[i]
    //   if (!asset) return
    //   if (asset.token === market?.quote.id) {
    //     form.store.setState(
    //       (state) => {
    //         return {
    //           ...state,
    //           values: {
    //             ...state.values,
    //             assets: [
    //               ...assets,
    //               { ...asset, limitPrice: event.detail.price },
    //             ],
    //           },
    //         }
    //       },
    //       {
    //         priority: "high",
    //       },
    //     )
    //     form.validateAllFields("blur")
    //     if (sendAmount === "") return
    //   }
  }

  // form.validateAllFields("blur")
  // if (sendAmount === "") return

  const {
    setGlobalError,
    errors,
    setErrors,
    isChangingFrom,
    setIsChangingFrom,
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    setSendSource,
    setSendAmount,
    setSendToken,
    setAssets,
    setTimeInForce,
    setTimeToLive,
    setTimeToLiveUnit,
  } = useNewStratStore()

  // console.log({ openMarkets })

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

  // console.log({ openMarkets, availableTokens })

  const logics = mangrove ? Object.values(mangrove.logics) : []

  const minBid = market?.getSemibook("bids").getMinimumVolume(220_000)
  const tickSize = marketInfo?.tickSpacing
    ? `${((1.0001 ** marketInfo?.tickSpacing - 1) * 100).toFixed(2)}%`
    : ""

  const selectedToken = availableTokens.find((token) => token.id == sendToken)
  const selectedSource = logics.find((logic) => logic?.id == sendSource)
  const minVolume = minBid?.toFixed(selectedToken?.displayedDecimals)

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

  const assetsWithTokens = assets.map((asset) => ({
    ...asset,
    token: availableTokens.find((tokens) => tokens.id === asset.token),
  }))

  const { useAbleTokens, sendFromBalance } = liquiditySourcing({
    availableTokens,
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address,
    logics,
  })

  const { formatted } = useTokenBalance(selectedToken)

  const balanceLogic_temporary =
    selectedToken?.id.includes("WBTC") || selectedSource?.id === "simple"
      ? formatted
      : sendFromBalance?.formatted

  //   const debouncedStepSize = useDebounce(stepSize, 300)
  //   const debouncedPricePoints = useDebounce(pricePoints, 300)
  //   const fieldsDisabled = !(minPrice && maxPrice)

  //   const setAssets = useNewStratStore(
  //     (store) => store.setAssets,
  //   )

  //   React.useEffect(() => {
  //     if (kandelRequirementsQuery.error) {
  //       setGlobalError(getErrorMessage(kandelRequirementsQuery.error))
  //       return
  //     }
  //     setGlobalError(undefined)
  //   }, [kandelRequirementsQuery.error])

  React.useEffect(() => {
    if (isChangingFrom === "sendSource" || !sendSource) return
    setSendSource(sendSource)
  }, [sendSource])

  React.useEffect(() => {
    if (isChangingFrom === "sendAmount" || !sendAmount) return
    setSendAmount(sendAmount)
  }, [sendAmount])

  React.useEffect(() => {
    if (isChangingFrom === "sendToken" || !sendToken) return
    setSendToken(sendToken)
  }, [sendToken])

  const handleFieldChange = (field: ChangingFrom) => {
    setIsChangingFrom(field)
  }

  const handleSendSource = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendSource")
    const value = typeof e === "string" ? e : e.target.value
    setSendSource(value)
  }

  const handleSentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendAmount")
    const value = typeof e === "string" ? e : e.target.value
    setSendAmount(value)
  }

  const handeSendTokenChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendToken")
    const value = typeof e === "string" ? e : e.target.value
    setSendToken(value)
  }

  const handleAssetsChange = (
    e: React.ChangeEvent<HTMLInputElement> | Asset[],
  ) => {
    handleFieldChange("assets")
    const value = Array.isArray(e) ? e : []
    setAssets(value)
  }

  const handleTimeInForceChange = (
    e: React.ChangeEvent<HTMLInputElement> | TimeInForce,
  ) => {
    handleFieldChange("timeInForce")
    const value = typeof e === "string" ? e : TimeInForce.IMMEDIATE_OR_CANCEL
    setTimeInForce(value)
  }

  const handleTimeToLiveChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("timeToLive")
    const value = typeof e === "string" ? e : e.target.value
    setTimeToLive(value)
  }

  const handleTimeToLiveUnit = (
    e: React.ChangeEvent<HTMLInputElement> | TimeToLiveUnit,
  ) => {
    handleFieldChange("timeToLiveUnit")
    const value = typeof e === "string" ? e : TimeToLiveUnit.DAY
    setTimeToLive(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    // send amount validation
    if (Number(sendAmount) > Number(balanceLogic_temporary) && sendAmount) {
      newErrors.sendAmount = "Amount cannot be greater than wallet balance"
    } else if (Number(sendAmount) <= 0 && sendAmount) {
      newErrors.sendAmount = "Amount must be greater than 0"
    } else {
      delete newErrors.sendAmount
    }

    assets.map((asset, index) => {
      if (Number(asset.limitPrice) <= 0 && asset.limitPrice) {
        newErrors[`limitPrice${index}`] = "Limit Price must be greater than 0"
      } else {
        delete newErrors?.[`limitPrice${index}`]
      }
    })

    setErrors(newErrors)
  }, [
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
  ])

  return {
    setGlobalError,
    errors,
    setErrors,
    isChangingFrom,
    setIsChangingFrom,
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    minBid,
    tickSize,
    selectedToken,
    selectedSource,
    minVolume,
    currentTokens,
    useAbleTokens,
    sendFromBalance,
    balanceLogic_temporary,
    assetsWithTokens,

    setSendSource,
    setSendAmount,
    setSendToken,
    setAssets,
    setTimeInForce,
    setTimeToLive,
    setTimeToLiveUnit,
    address,
    availableTokens,
    logics,
    handleSendSource,
    handleSentAmountChange,
    handeSendTokenChange,
    handleAssetsChange,
    handleTimeInForceChange,
    handleTimeToLiveChange,
    handleTimeToLiveUnit,
  }
}