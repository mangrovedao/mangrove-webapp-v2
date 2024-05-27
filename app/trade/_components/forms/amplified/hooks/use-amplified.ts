import { Logic } from "@mangrovedao/mgv"
import { minVolume as getMinimumVolume } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import React from "react"
import { useAccount } from "wagmi"

import { useBook } from "@/hooks/use-book"
import useMangrove from "@/providers/mangrove"
import {
  default as useMarket,
  default as useMarketNew,
} from "@/providers/market.new"
import { useEventListener } from "usehooks-ts"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import { Asset, AssetWithInfos } from "../types"
import { getCurrentTokenPrice } from "../utils"
import amplifiedLiquiditySourcing from "./amplified-liquidity-sourcing"
import { ChangingFrom, useNewStratStore } from "./amplified-store"

import { useLogics } from "@/hooks/use-addresses"
import { LocalConfig, Token } from "@mangrovedao/mgv"
import { formatUnits } from "viem"

export const MIN_PRICE_POINTS = 2
export const MIN_RATIO = 1.001
export const MIN_STEP_SIZE = 1

export default function useAmplifiedForm() {
  const { address } = useAccount()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const { currentMarket } = useMarket()
  const { book } = useBook()
  const logics = useLogics()

  const { currentMarket: market, markets } = useMarketNew()

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

      const tokenPrice = getCurrentTokenPrice(asset.token, markets)

      if (tokenPrice?.address === market?.quote.address) {
        newAssets[i] = {
          ...asset,
          limitPrice: event.detail.price,
        }
      }
    })

    handleAssetsChange(newAssets)
  }

  const availableTokens =
    markets?.reduce((acc, current) => {
      if (!acc.includes(current.base)) {
        acc.push(current.base)
      }
      if (!acc.includes(current.quote)) {
        acc.push(current.quote)
      }

      return acc
    }, [] as Token[]) ?? []

  const tickSize = currentMarket?.tickSpacing
    ? `${((1.0001 ** Number(currentMarket?.tickSpacing) - 1) * 100).toFixed(2)}%`
    : ""

  const selectedToken = availableTokens.find(
    (token) => token.address == sendToken,
  )

  const selectedSource = logics?.find((logic) => logic?.name == sendSource)

  const compatibleMarkets = openMarkets?.filter(
    (market) =>
      market.base.address === selectedToken?.address ||
      market.quote.address === selectedToken?.address,
  )

  const currentTokens = availableTokens?.filter((token) => {
    if (selectedToken?.address === token.address) return false

    return compatibleMarkets?.some(
      (market) =>
        market.base.address == token.address ||
        market.quote.address == token.address,
    )
  })

  const assetsWithTokens = assets.map((asset) => ({
    ...asset,
    token: availableTokens.find((tokens) => tokens.address === asset.token),
    receiveTo: logics.find((logic) => logic?.name === asset.receiveTo),
  }))

  const { useAbleTokens, sendFromBalance } = amplifiedLiquiditySourcing({
    availableTokens,
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address,
    logics: logics as Logic[],
  })

  const balanceLogic_temporary = sendFromBalance?.formatted

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
    const selectedSourceGasOverhead = selectedSource?.gasreq || 200_000
    const semibookAsks = book?.asks
    const semibookBids = book?.bids
    const isBid = markets?.find(
      (market) => market.base.address === sendToken,
    )?.quote
    const priceToken = isBid
    const variableCost = Big(60_000).mul(assetsWithTokens.length).add(60_000)

    // const calculateGasReq = (asset: AssetWithInfos) => {
    //   return BigInt(
    //     Math.max(
    //       Number(asset.receiveTo?.gasreq || 200_000),
    //       Number(selectedSourceGasOverhead),
    //     ),
    //   ) + BigInt(variableCost)
    // }

    const calculateGasReq = (asset: AssetWithInfos) => {
      const maxGasReq = Math.max(
        Number(asset.receiveTo?.gasreq || 200_000),
        Number(selectedSourceGasOverhead),
      )
      const totalGasReq = Big(maxGasReq).add(variableCost)
      return BigInt(totalGasReq.toString())
    }

    const calculateMinVolume = (
      asset: AssetWithInfos,
      localConfig: LocalConfig,
    ) => {
      if (!asset.token || !asset.limitPrice || !localConfig) return 0n
      return getMinimumVolume(localConfig, calculateGasReq(asset))
    }

    const newMinVolume = assetsWithTokens.reduce((acc, asset) => {
      if (!book) return 0n
      const semibook = isBid ? book?.asksConfig : book?.bidsConfig
      return acc + calculateMinVolume(asset as AssetWithInfos, semibook)
    }, 0n)

    setMinVolume({
      total: formatUnits(
        newMinVolume,
        (isBid
          ? selectedToken?.displayDecimals
          : priceToken?.displayDecimals) || 8,
      ),
      volume: formatUnits(newMinVolume, selectedToken?.displayDecimals || 8),
    })
  }, [assets, sendToken])

  React.useEffect(() => {
    const newErrors = { ...errors }

    if (Number(sendAmount) > Number(balanceLogic_temporary) && sendAmount) {
      newErrors.sendAmount = "Amount cannot be greater than wallet balance"
    } else if (Number(sendAmount) <= 0 && sendAmount) {
      newErrors.sendAmount = "Amount must be greater than 0"
    } else if (sendAmount && minVolume.total && minVolume.total > sendAmount) {
      newErrors.sendAmount = "Amount cannot be lower than min. volume"
    } else {
      delete newErrors.sendAmount
    }

    assets.map((asset, index) => {
      if (Number(asset.limitPrice) <= 0 && asset.limitPrice) {
        newErrors[`limitPrice-${index}`] = "Limit Price must be greater than 0"
      } else if (!asset.receiveTo && asset.token) {
        newErrors[`receiveTo-${index}`] = "Please select a receive logic"
      } else if (!asset.token && asset.limitPrice) {
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
    markets,
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
