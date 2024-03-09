import React from "react"
import { useAccount } from "wagmi"

import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import { useEventListener } from "usehooks-ts"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import { Asset } from "../types"
import { getCurrentTokenPrice } from "../utils"
import amplifiedLiquiditySourcing from "./amplified-liquidity-sourcing"
import { ChangingFrom, useNewStratStore } from "./amplified-store"

export const MIN_PRICE_POINTS = 2
export const MIN_RATIO = 1.001
export const MIN_STEP_SIZE = 1

export default function useAmplifiedForm() {
  const { address } = useAccount()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { market, marketInfo } = useMarket()

  const { data: openMarkets } = marketsInfoQuery

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
    setMinVolume,
    minVolume,
  } = useNewStratStore()

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    let newAssets = [...assets]

    assets.forEach((asset, i) => {
      if (!asset) return

      const tokenPrice = getCurrentTokenPrice(asset.token, openMarkets)

      if (tokenPrice?.id === market?.quote.id) {
        newAssets[i] = {
          ...asset,
          limitPrice: event.detail.price,
        }
      }
    })

    handleAssetsChange(newAssets)
  }

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

  const logics = mangrove ? Object.values(mangrove.logics) : []

  const tickSize = marketInfo?.tickSpacing
    ? `${((1.0001 ** marketInfo?.tickSpacing - 1) * 100).toFixed(2)}%`
    : ""

  const selectedToken = availableTokens.find((token) => token.id == sendToken)
  const selectedSource = logics.find((logic) => logic?.id == sendSource)

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
    receiveTo: logics.find((logic) => logic?.id === asset.receiveTo),
  }))

  const { useAbleTokens, sendFromBalance } = amplifiedLiquiditySourcing({
    availableTokens,
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address,
    logics,
  })

  const { formatted } = useTokenBalance(selectedToken)

  const balanceLogic_temporary =
    selectedSource?.id === "simple" ? formatted : sendFromBalance?.formatted

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

  const computeReceiveAmount = (
    amount: string,
    limitPrice: string,
    tokenId: string,
  ) => {
    if (!limitPrice || !amount) return "0"
    if (openMarkets?.find((market) => market.base.id === tokenId)) {
      return Big(!isNaN(Number(amount)) ? Number(amount) : 0)
        .div(
          Big(
            !isNaN(Number(limitPrice)) && Number(limitPrice) > 0
              ? Number(limitPrice)
              : 1,
          ),
        )
        .toString()
    } else {
      return Big(!isNaN(Number(limitPrice)) ? Number(limitPrice) : 0)
        .times(
          Big(
            !isNaN(Number(amount)) && Number(amount) > 0 ? Number(amount) : 0,
          ),
        )
        .toString()
    }
  }

  const handeSendTokenChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendToken")
    const value = typeof e === "string" ? e : e.target.value
    setSendToken(value)
  }

  const handleSentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendAmount")
    const value = typeof e === "string" ? e : e.target.value
    setSendAmount(value)
  }

  React.useEffect(() => {
    handleAssetsChange(
      assets.map((asset) => {
        const amount = computeReceiveAmount(
          sendAmount,
          asset.limitPrice,
          asset.token,
        )
        return {
          ...asset,
          amount: !sendAmount ? "0" : amount,
        }
      }),
    )
  }, [sendAmount])

  const handleAssetsChange = (
    e: React.ChangeEvent<HTMLInputElement> | Asset[],
  ) => {
    handleFieldChange("assets")
    const value = Array.isArray(e) ? e : []
    setAssets(
      value.map((asset) => {
        const amount = computeReceiveAmount(
          sendAmount,
          asset.limitPrice,
          asset.token,
        )
        return {
          ...asset,
          amount,
        }
      }),
    )
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
    let newMinVolume = 0
    let minVolume = 0
    const selectedSourceGasOverhead = selectedSource?.gasOverhead || 200_000
    const semibookAsks = market?.getSemibook("asks")
    const semibookBids = market?.getSemibook("bids")
    const isBid = openMarkets?.find((market) => market.base.id === sendToken)
      ?.base.id

    assets.forEach((asset) => {
      if (!asset.token || !asset.limitPrice) return
      minVolume = isBid
        ? Number(semibookAsks?.getMinimumVolume(selectedSourceGasOverhead) || 0)
        : Number(semibookBids?.getMinimumVolume(selectedSourceGasOverhead) || 0)
      newMinVolume += minVolume ? Number(minVolume) : 0
    })

    setMinVolume({
      total: newMinVolume.toFixed(selectedToken?.displayedDecimals),
      volume: minVolume.toFixed(selectedToken?.displayedDecimals),
    })
  }, [assets, sendToken])

  React.useEffect(() => {
    const newErrors = { ...errors }

    if (Number(sendAmount) > Number(balanceLogic_temporary) && sendAmount) {
      newErrors.sendAmount = "Amount cannot be greater than wallet balance"
    } else if (Number(sendAmount) <= 0 && sendAmount) {
      newErrors.sendAmount = "Amount must be greater than 0"
    } else if (minVolume.total && minVolume.total > sendAmount) {
      newErrors.sendAmount = "Amount cannot be lower than min. volume"
    } else {
      delete newErrors.sendAmount
    }

    assets.map((asset, index) => {
      if (Number(asset.limitPrice) <= 0 && asset.limitPrice) {
        newErrors[`limitPrice-${index}`] = "Limit Price must be greater than 0"
      } else if (!asset.receiveTo) {
        newErrors[`receiveTo-${index}`] = "Please select a receive logic"
      } else if (!asset.token) {
        newErrors[`token-${index}`] = "Please select a token"
      } else {
        delete newErrors[`limitPrice-${index}`]
        delete newErrors[`receiveTo-${index}`]
        delete newErrors[`token-${index}`]
      }
    })

    setErrors(newErrors)
  }, [
    minVolume,
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
  ])

  return {
    errors,
    isChangingFrom,
    openMarkets,
    sendSource,
    minVolume,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    tickSize,
    selectedToken,
    selectedSource,
    currentTokens,
    useAbleTokens,
    sendFromBalance,
    balanceLogic_temporary,
    assetsWithTokens,
    address,
    availableTokens,
    logics,
    setGlobalError,
    setIsChangingFrom,
    setErrors,
    setSendSource,
    setSendAmount,
    setSendToken,
    setAssets,
    setTimeInForce,
    setTimeToLive,
    setTimeToLiveUnit,
    handleSendSource,
    handleSentAmountChange,
    handeSendTokenChange,
    handleAssetsChange,
    handleTimeInForceChange,
    handleTimeToLiveChange,
    handleTimeToLiveUnit,
  }
}
