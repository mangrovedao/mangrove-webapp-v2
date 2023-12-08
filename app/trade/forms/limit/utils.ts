import { Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import { toast } from "sonner"

import { bsToBa } from "@/utils/market"
import { TradeAction } from "../enums"
import { TimeToLiveUnit } from "./enums"

export function getNumberOfSeconds(timeToLiveUnit: `${TimeToLiveUnit}`) {
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

export function handleOrderResultToastMessages(
  result: Market.OrderResult,
  tradeAction: TradeAction,
  market: Market,
) {
  const { base, quote } = market
  const baseDecimals = base.decimals
  const quoteDecimals = quote.decimals
  const isBuy = tradeAction === TradeAction.BUY
  const summary = result.summary
  if (summary.partialFill && !result.restingOrder && summary.totalGot?.eq(0)) {
    toast.success("Order hasn't been filled", {
      className: "bg-orange-400",
    })
    return
  }

  const fillText = summary.partialFill ? "\npartially filled" : "filled"
  let msg = `Order for ${base.toFixed(baseDecimals)} ${base.symbol} ${fillText}`

  if (summary.partialFill) {
    const filled = isBuy ? summary.totalGot : summary.totalGave
    msg += ` with ${Big(filled ?? 0).toFixed(baseDecimals)} ${base.symbol}`
  }

  if (summary.partialFill && result.restingOrder) {
    const { gives, price } = result.restingOrder
    const wants = Market.getWantsForPrice(bsToBa(tradeAction), gives, price)
    const remaining = isBuy ? wants : result.restingOrder.gives
    msg += `\nResting order for ${remaining.toFixed(baseDecimals)} ${
      base.symbol
    }\nposted on the book`
    // setTimeout(() => {
    //   queryClient.invalidateQueries(["openOrdersQuery"])
    // }, 2000)
  }

  // refresh history only if an history line has been created
  // if (summary.totalGot?.gt(0)) {
  //   setTimeout(() => {
  //     queryClient.invalidateQueries(["orderHistory"])
  //   }, 2000)
  // }
  toast.success(msg)
}
