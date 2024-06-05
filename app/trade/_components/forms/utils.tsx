import { LimitOrderResult, type Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { toast } from "sonner"
import { formatUnits } from "viem"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { TradeMode } from "./enums"

export function successToast(
  tradeMode: TradeMode,
  tradeAction: BS,
  baseToken: Token,
  quoteToken: Token,
  result: LimitOrderResult,
  receiveToken: Token,
  sendToken: Token,
) {
  const baseValue = tradeAction === BS.buy ? result.takerGot : result.takerGave
  const quoteValue = tradeAction === BS.buy ? result.takerGave : result.takerGot
  const filledOrder = `Filled with ${Number(formatUnits(quoteValue, quoteToken.decimals)).toFixed(quoteToken.displayDecimals)} ${quoteToken.symbol}`
  const notFilledOrder =
    tradeMode == TradeMode.LIMIT
      ? "Limit order posted"
      : "Market order not filled (slippage too low)"

  const fillText = Number(result.takerGot) > 0 ? filledOrder : notFilledOrder

  toast(
    <div className="grid gap-2 w-full">
      <div className="flex space-x-2 items-center">
        <TokenIcon symbol={sendToken.symbol} />
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
            {Number(formatUnits(baseValue, baseToken.decimals)).toFixed(
              baseToken.priceDisplayDecimals,
            )}{" "}
            {baseToken.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">FEE</span>
          <span>
            {Number(formatUnits(result.feePaid, receiveToken.decimals)).toFixed(
              receiveToken.displayDecimals + 2,
            )}{" "}
            {receiveToken.symbol}
          </span>
        </div>
      </div>
    </div>,
    { duration: 5000, dismissible: true },
  )
}
