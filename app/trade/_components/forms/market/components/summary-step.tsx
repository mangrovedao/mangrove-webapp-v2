import type { Token } from "@mangrovedao/mgv"
import Big from "big.js"

import { TokenIcon } from "@/components/token-icon"
import { cn } from "@/utils"

import { BS } from "@mangrovedao/mgv/lib"
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
      <div className="rounded-lg p-3 space-y-4 border border-border-secondary">
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
          <Line title="Type">Market</Line>
          <Line title="Liquidity source">Wallet</Line>
          <Line title="Base amount">
            {Big(form.send ?? 0).toFixed(sendToken?.displayDecimals)}{" "}
            <Unit>{sendToken?.symbol}</Unit>
          </Line>
          <Line title="Quote amount">
            {Big(form.receive ?? 0).toFixed(receiveToken?.displayDecimals)}{" "}
            <Unit>{receiveToken?.symbol}</Unit>
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
    <div className={cn("w-full flex justify-between text-sm", className)}>
      <span>{title}</span>
      <span className="text-white">{children}</span>
    </div>
  )
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="text-text-primary">{children}</span>
}
