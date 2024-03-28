import type { Token } from "@mangrovedao/mangrove.js"
import Big from "big.js"

import { TokenIcon } from "@/components/token-icon"
import { Text } from "@/components/typography/text"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import { DefaultTradeLogics } from "../../types"
import { TimeInForce } from "../enums"
import type { AssetWithInfos, Form } from "../types"

type Props = {
  form: Omit<Form, "assets">
  tokenToAmplify?: Token
  sendAmount: string
  source: DefaultTradeLogics
  assetsWithToken?: AssetWithInfos[]
}

export function SummaryStep({
  tokenToAmplify,
  assetsWithToken,
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
      <Line
        title={`Send from ${source?.id.includes("simple") ? "Wallet" : source?.id.toUpperCase()}`}
      >
        {Big(
          !isNaN(Number(form.sendAmount)) ? Number(form.sendAmount) : 0,
        ).toFixed(8)}{" "}
        <Unit>{tokenToAmplify?.symbol}</Unit>
      </Line>
      <Separator />
      <div className="space-y-4">
        {assetsWithToken?.map(
          (asset) =>
            asset.token &&
            asset.receiveTo && (
              <>
                <div className="flex items-center space-x-2">
                  <TokenIcon
                    className="w-7 h-auto"
                    symbol={asset.token.symbol}
                  />
                  <span className="text-white text-xl font-medium">
                    {asset.token.symbol}
                  </span>
                </div>

                <Line title="Limit Price">
                  {Big(
                    !isNaN(Number(asset.limitPrice))
                      ? Number(asset.limitPrice)
                      : 0,
                  ).toFixed(asset.token.displayedAsPriceDecimals)}{" "}
                  <Unit>{asset.token.symbol}</Unit>
                </Line>
                <Line
                  title={`Receive to ${asset.receiveTo.id === "simple" ? "Wallet" : asset.receiveTo.id.toUpperCase()}`}
                >
                  {Big(
                    !isNaN(Number(asset.amount)) ? Number(asset.amount) : 0,
                  ).toFixed(asset.token.displayedDecimals)}{" "}
                  <Unit>{asset.token.symbol}</Unit>
                </Line>
              </>
            ),
        )}
        <Separator className="!my-5" />
        <Line title="Time in force">
          <div className="flex flex-col items-end">
            {form.timeInForce}{" "}
            {form.timeInForce === TimeInForce.GOOD_TIL_TIME && (
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
