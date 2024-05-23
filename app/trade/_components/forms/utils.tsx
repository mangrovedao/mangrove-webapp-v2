import { type Market, type Token } from "@mangrovedao/mangrove.js"
import { BS } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import { toast } from "sonner"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { TradeMode } from "./enums"

export function successToast(
  tradeMode: TradeMode,
  tradeAction: BS,
  baseToken: Token,
  baseValue: string,
  result: Market.OrderResult,
) {
  const summary = result.summary
  const price = result.offerWrites[0]?.offer.price.toFixed(4)

  const filledOrder =
    tradeMode == TradeMode.LIMIT
      ? `Filled with ${summary.totalGot.toFixed(baseToken.displayedDecimals)} ${summary.restingOrder ? ", remaining volume is posted" : ""} `
      : `Filled with ${summary.totalGot.toFixed(baseToken.displayedDecimals)}`

  const notFilledOrder =
    tradeMode == TradeMode.LIMIT
      ? "Limit order posted"
      : "Market order not filled (slippage too low)"

  const fillText = Number(summary.totalGot) > 0 ? filledOrder : notFilledOrder

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
              tradeAction === BS.buy ? "text-green-500" : "text-red-600"
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
