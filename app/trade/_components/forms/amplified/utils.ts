import { useMarkets } from "@/hooks/use-addresses"
import { TimeToLiveUnit } from "./enums"

function getNumberOfSeconds(timeToLiveUnit: `${TimeToLiveUnit}`) {
  let seconds: number
  switch (timeToLiveUnit) {
    case TimeToLiveUnit.DAY:
      seconds = 86400
      break
    case TimeToLiveUnit.HOUR:
      seconds = 3600
      break
    case TimeToLiveUnit.MIN:
      seconds = 60
      break
    default:
      throw new Error("Not implemented")
  }
  return seconds
}

export function estimateTimestamp({
  timeToLiveUnit,
  timeToLive,
}: {
  timeToLiveUnit: `${TimeToLiveUnit}` | null
  timeToLive: string
}) {
  const seconds = getNumberOfSeconds(timeToLiveUnit ?? TimeToLiveUnit.DAY)
  return Math.trunc(Date.now() / 1000 + seconds * parseInt(timeToLive))
}

function getFormattedUnit(timeToLiveUnit: `${TimeToLiveUnit}` | undefined) {
  let formattedUnit: string
  switch (timeToLiveUnit) {
    case TimeToLiveUnit.DAY:
      formattedUnit = "day"
      break
    case TimeToLiveUnit.HOUR:
      formattedUnit = "hour"
      break
    case TimeToLiveUnit.MIN:
      formattedUnit = "minute"
      break
    default:
      throw new Error("Not implemented")
  }
  return formattedUnit
}

export function getFormattedTimeToLive(
  timeToLiveValue: string | undefined,
  timeToLiveUnit?: `${TimeToLiveUnit}` | null,
) {
  return `${timeToLiveValue} ${getFormattedUnit(
    timeToLiveUnit ?? TimeToLiveUnit.DAY,
  )}${Number(timeToLiveValue) > 1 ? "s" : ""}`
}

export const getCurrentTokenPrice = (
  tokenAddress: string,
  markets?: ReturnType<typeof useMarkets>,
) => {
  const market = markets?.find(
    (market) =>
      market.base.address === tokenAddress ||
      market.quote.address === tokenAddress,
  )
  return market?.quote || market?.base
}

export const getCurrentTokenPriceFromAddress = (
  tokenAddress: string,
  openMarkets?: ReturnType<typeof useMarkets>,
) => {
  const market = openMarkets?.find(
    (market) =>
      market.base.address.toLowerCase() == tokenAddress.toLowerCase() ||
      market.quote.address.toLowerCase() == tokenAddress.toLowerCase(),
  )
  return market?.quote || market?.base
}
