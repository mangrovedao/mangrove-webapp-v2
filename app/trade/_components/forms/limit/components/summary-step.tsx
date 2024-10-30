import type { Token } from "@mangrovedao/mgv"
import Big from "big.js"

import { TokenIcon } from "@/components/token-icon"
import { cn } from "@/utils"
import { BS } from "@mangrovedao/mgv/lib"
import { TimeInForce } from "../enums"
import type { Form } from "../types"

type Props = {
  form: Form
  fee: string
  baseToken?: Token
  quoteToken?: Token
  sendToken?: Token
  receiveToken?: Token
}

export function SummaryStep({
  fee,
  baseToken,
  quoteToken,
  sendToken,
  receiveToken,
  form,
}: Props) {
  const sendFrom = form.sendFrom.includes("simple")
    ? "Wallet"
    : form.sendFrom.toUpperCase()
  const receiveTo = form.receiveTo.includes("simple")
    ? "Wallet"
    : form.receiveTo.toUpperCase()

  const timeInForceKey = TimeInForce[form.timeInForce]
  const showTimeToLive =
    (form.timeToLive && form.timeInForce === TimeInForce.GTC) ||
    form.timeInForce === TimeInForce.PO

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          <TokenIcon className="w-7 h-auto" symbol={baseToken?.symbol} />
          <TokenIcon className="w-7 h-auto" symbol={quoteToken?.symbol} />
        </div>
        <span className="text-white text-xl font-medium">
          {baseToken?.symbol} / {quoteToken?.symbol}
        </span>
      </div>
      <div className="rounded-lg p-4 space-y-4 border border-border-secondary">
        <div className="space-y-4">
          <Line title="Side">
            <span
              className={cn(
                form.bs === BS.sell && "text-red-100",
                form.bs === BS.buy && "text-green-500",
              )}
            >
              {form.bs === BS.sell ? "Sell" : "Buy"}
            </span>
          </Line>
          <Line title="Type">Limit</Line>
          <Line title="Liquidity source">Wallet</Line>
          <Line title="Limit Price">
            {Big(form.limitPrice ?? 0).toFixed(
              quoteToken?.priceDisplayDecimals,
            )}{" "}
            <Unit>{quoteToken?.symbol}</Unit>
          </Line>
          <Line title={`Send from ${sendFrom}`}>
            {Big(form.send ?? 0).toFixed(sendToken?.displayDecimals)}{" "}
            <Unit>{sendToken?.symbol}</Unit>
          </Line>
          <Line title={`Receive to ${receiveTo}`}>
            {Big(form.receive ?? 0).toFixed(receiveToken?.displayDecimals)}{" "}
            <Unit>{receiveToken?.symbol}</Unit>
          </Line>
          <Line title="Fee">{fee}</Line>
          {/* TODO: estimated provision */}
          {/* <Line title="Est. Provision">
          0.2503 <Unit>MATIC</Unit>
        </Line> */}
          <Line title="Time in force">
            <div className="flex flex-col items-end">
              {timeInForceKey}{" "}
              {showTimeToLive && (
                <Unit>
                  {form.timeToLive}{" "}
                  <span className="lowercase">
                    {Number(form.timeToLive) > 1
                      ? `${form.timeToLiveUnit}s`
                      : form.timeToLiveUnit}
                  </span>
                </Unit>
              )}
            </div>
          </Line>
        </div>
      </div>
    </>
  )
}

type LineProps = {
  title: string
}
function Line({
  title,
  children,
  className,
}: LineProps & { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full flex justify-between text-base", className)}>
      <span>{title}</span>
      <span className="text-white">{children}</span>
    </div>
  )
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="text-text-primary">{children}</span>
}
