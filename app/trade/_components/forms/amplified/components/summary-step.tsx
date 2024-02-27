import type { Token } from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import Big from "big.js"

import { TokenIcon } from "@/components/token-icon"
import { Text } from "@/components/typography/text"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import type { Form } from "../types"

type Props = {
  form: Form
  tokenToAmplify?: Token
  sendAmount: string
  source: SimpleLogic | SimpleAaveLogic
  receiveTokens?: {
    token: Token
    receiveTo: string
    amount: string
    limitPrice: string
  }[]
}

export function SummaryStep({
  tokenToAmplify,
  receiveTokens,
  source,
  form,
}: Props) {
  return (
    <div className="bg-[#041010] rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Text className="text-primary"> Amplify </Text>
        <TokenIcon className="w-7 h-auto" symbol={tokenToAmplify?.symbol} />
        <span className="text-white text-xl font-medium">
          {tokenToAmplify?.symbol}
        </span>
      </div>
      <Separator />
      <div className="space-y-4">
        <Line
          title={`Send from ${source.id.includes("simple") ? "Wallet" : source.id.toUpperCase()}`}
        >
          {Big(form.sendAmount ?? 0).toFixed(8)}{" "}
          <Unit>{tokenToAmplify?.symbol}</Unit>
        </Line>

        {receiveTokens?.map(
          (receiveToken) =>
            receiveToken.token &&
            receiveToken.receiveTo && (
              <>
                <div className="flex items-center space-x-2">
                  <TokenIcon
                    className="w-7 h-auto"
                    symbol={receiveToken.token.symbol}
                  />
                  <span className="text-white text-xl font-medium">
                    {receiveToken.token.symbol}
                  </span>
                </div>

                <Line title="Limit Price">
                  {Big(receiveToken.limitPrice ?? 0).toFixed(
                    receiveToken.token.displayedAsPriceDecimals,
                  )}{" "}
                  <Unit>{receiveToken.token.symbol}</Unit>
                </Line>
                <Line
                  title={`Receive to ${receiveToken.receiveTo.includes("simple") ? "Wallet" : receiveToken.receiveTo.toUpperCase()}`}
                >
                  {Big(receiveToken.amount ?? 0).toFixed(
                    receiveToken.token.displayedDecimals,
                  )}{" "}
                  <Unit>{receiveToken.token.symbol}</Unit>
                </Line>
              </>
            ),
        )}
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
