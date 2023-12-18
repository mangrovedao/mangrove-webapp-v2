import { Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import { toast } from "sonner"

import { bsToBa } from "@/utils/market"
import { TradeAction } from "../enums"

export function handleOrderResultToastMessages(
  result: Market.OrderResult,
  tradeAction: TradeAction,
  market: Market,
) {
  const { base } = market
  const baseDecimals = base.decimals
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
