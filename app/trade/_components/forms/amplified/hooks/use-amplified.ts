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

  // TODO: fix TS type for useEventListener
  // @ts-expect-error
  useEventListener("on-orderbook-offer-clicked", handleOnOrderbookOfferClicked)

  function handleOnOrderbookOfferClicked(
    event: CustomEvent<{ price: string }>,
  ) {
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      if (!asset) return
      if (asset.token === market?.quote.id) {
        handleAssetsChange([
          ...assets.slice(0, i),
          {
            ...asset,
            limitPrice: event.detail.price,
          },
          ...assets.slice(i + 1),
        ])
      }
    }
  }

  // const computeReceiveAmount = React.useCallback(() => {

  //   })
  //   handleAssetsChange(assetsWithReceivingAmounts)
  // }, [setAssets])

  // const computeReceiveAmount = () => {
  //   assets.forEach((asset, i) => {
  //     const amount = Big(
  //       !isNaN(Number(asset.limitPrice)) ? Number(asset.limitPrice) : 0,
  //     )
  //       .times(
  //         Big(
  //           !isNaN(Number(asset.amount)) && Number(asset.amount) > 0
  //             ? Number(asset.amount)
  //             : 0,
  //         ),
  //       )
  //       .toString()

  //     handleAssetsChange([
  //       ...assets.slice(0, i),
  //       {
  //         ...asset,
  //         amount,
  //       },
  //       ...assets.slice(i + 1),
  //     ])
  //   })
  // }

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
    receiveTo: logics.find((logic) => logic?.id === asset.receiveTo),
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
    const newErrors = { ...errors }

    if (Number(sendAmount) > Number(balanceLogic_temporary) && sendAmount) {
      newErrors.sendAmount = "Amount cannot be greater than wallet balance"
    } else if (Number(sendAmount) <= 0 && sendAmount) {
      newErrors.sendAmount = "Amount must be greater than 0"
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
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
  ])

  return {
    // computeReceiveAmount,
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
    openMarkets,
  }
}
