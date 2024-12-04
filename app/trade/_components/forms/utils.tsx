import { LimitOrderResult, type Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { toast } from "sonner"
import { formatUnits, parseUnits } from "viem"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { TradeMode } from "./enums"

export function successToast(
  tradeMode: TradeMode,
  tradeAction: BS,
  baseToken: Token,
  quoteToken: Token,
  wants: string,
  result: LimitOrderResult,
  receiveToken: Token,
  sendToken: Token,
) {
  const isSell = tradeAction === BS.sell

  const filledOrder = `Filled with ${Number(
    formatUnits(
      result.takerGot,
      isSell ? quoteToken.decimals : baseToken.decimals,
    ),
  ).toFixed(
    tradeAction === BS.sell
      ? quoteToken.displayDecimals
      : baseToken.displayDecimals,
  )} ${isSell ? quoteToken.symbol : baseToken.symbol}`

  const notFilledOrder =
    tradeMode == TradeMode.LIMIT
      ? "Limit order posted"
      : "Market order not filled (slippage limit too low)"

  const fillText = Number(result.takerGot) > 0 ? filledOrder : notFilledOrder
  console.log(result.feePaid)

  const approximateFee = (value: bigint, decimals: number) =>
    Number(formatUnits(value, decimals)) <= 0.001 ? "~ " : ""

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
            {Number(result.takerGot) <= 0 ? (
              <>
                {approximateFee(
                  parseUnits(
                    wants,
                    isSell ? quoteToken.decimals : baseToken.decimals,
                  ),
                  isSell
                    ? quoteToken.displayDecimals
                    : baseToken.displayDecimals,
                )}
                {Number(wants).toFixed(
                  isSell
                    ? quoteToken.displayDecimals
                    : baseToken.displayDecimals,
                )}
              </>
            ) : !isSell ? (
              <>
                {approximateFee(result.takerGot, baseToken.decimals)}
                {Number(
                  formatUnits(result.takerGot, baseToken.decimals),
                ).toFixed(baseToken.displayDecimals)}
              </>
            ) : (
              <>
                {approximateFee(result.takerGave, baseToken.decimals)}
                {Number(
                  formatUnits(result.takerGave, baseToken.decimals),
                ).toFixed(baseToken.displayDecimals)}
              </>
            )}{" "}
            {isSell ? sendToken.symbol : receiveToken.symbol}
          </span>
        </div>
        {Number(result.feePaid) > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">FEE</span>
            <span>
              {approximateFee(result.feePaid, receiveToken.decimals)}
              {Number(
                formatUnits(result.feePaid, receiveToken.decimals),
              ).toFixed(receiveToken.displayDecimals)}{" "}
              {receiveToken.symbol}
            </span>
          </div>
        ) : undefined}
      </div>
    </div>,
    { duration: 5000, dismissible: true },
  )
}
