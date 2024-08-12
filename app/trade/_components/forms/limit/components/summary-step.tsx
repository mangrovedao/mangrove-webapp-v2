import type { Token } from "@mangrovedao/mgv"
import Big from "big.js"

import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import { TimeInForce } from "../enums"
import type { Form } from "../types"

type Props = {
  form: Form
  baseToken?: Token
  quoteToken?: Token
  sendToken?: Token
  receiveToken?: Token
}

export function SummaryStep({
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
    <div className="bg-[#041010] rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          <TokenIcon className="w-7 h-auto" symbol={baseToken?.symbol} />
          <TokenIcon className="w-7 h-auto" symbol={quoteToken?.symbol} />
        </div>
        <span className="text-white text-xl font-medium">
          {baseToken?.symbol} / {quoteToken?.symbol}
        </span>
      </div>
      <Separator />
      <div className="space-y-4">
        <Line title="Limit Price">
          {Big(form.limitPrice ?? 0).toFixed(quoteToken?.priceDisplayDecimals)}{" "}
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
  return <span className="text-gray-scale-300">{children}</span>
}
