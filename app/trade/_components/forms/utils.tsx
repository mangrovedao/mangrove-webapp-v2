import { type Market, type Token } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import { toast } from "sonner"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { TradeAction, TradeMode } from "./enums"

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
