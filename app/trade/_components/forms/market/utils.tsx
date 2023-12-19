import { Market, type Token } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import { toast } from "sonner"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { bsToBa } from "@/utils/market"
import type { TradeMode } from "../enums"
import { TradeAction } from "../enums"

export function successToast(
  tradeMode: TradeMode,
  tradeAction: TradeAction,
  baseToken: Token,
  baseValue: string,
  result: Market.OrderResult,
) {
  const summary = result.summary
  const price = result.offerWrites[0]?.offer.price.toFixed(4)
  const fillText = summary.partialFill ? "Partially filled" : "Filled"

  toast(
    <div className="grid gap-2 w-full">
      <div className="flex space-x-2 items-center">
        <TokenIcon symbol={baseToken.symbol} />
        <div className="grid">
          <span>{tradeMode.toUpperCase()} Order</span>
          <span className="text-muted-foreground">{fillText}</span>
        </div>
      </div>

      <Separator />
      <div className="grid">
        <div className="flex justify-between">
          <span
            className={
              tradeAction === TradeAction.BUY
                ? "text-green-500"
                : "text-red-600"
            }
          >
            {tradeAction.toUpperCase()}
          </span>
          <span>
            {Big(baseValue).toFixed(baseToken.displayedAsPriceDecimals)}{" "}
            {baseToken.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">PRICE</span>
          <span>{price}</span>
        </div>
      </div>
    </div>,
    { duration: 5000, dismissible: true },
  )
}

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
