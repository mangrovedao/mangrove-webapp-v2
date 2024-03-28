import React from "react"

import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import * as SheetRoot from "@/components/ui/sheet"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import Big from "big.js"
import { Ban, Check } from "lucide-react"
import { Fill } from "@/app/trade/_components/tables/fills/schema"

type SheetLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const SheetLine = ({ title, item, secondaryItem }: SheetLineProps) => (
  <div className="flex justify-between items-center">
    <Text className="text-muted-foreground whitespace-nowrap">{title}:</Text>
    <div className="grid justify-items-end max-w-60">
      {item}
      {secondaryItem}
    </div>
  </div>
)

type HistoryDetailSheetProps = {
  onClose: () => void
  orderInfo?: Fill | null
}

export default function HistoryDetailSheet({
  orderInfo,
  onClose,
}: HistoryDetailSheetProps) {
  if (!orderInfo) return null
  const order = orderInfo
  const {
    creationDate,
    status,
    isMarketOrder,
    initialWants,
    takerGot,
    isBid,
    price,
  } = order
  const isFilled = status === "FILLED"
  const { market } = useMarket()

  const baseSymbol = market?.base.symbol
  const quoteSymbol = market?.quote.symbol
  const symbol = isBid ? baseSymbol : quoteSymbol
  const displayDecimals = isBid
    ? market?.base.displayedDecimals
    : market?.quote.displayedDecimals

  const amount = Big(initialWants).toFixed(displayDecimals)
  const filled = Big(takerGot).toFixed(displayDecimals)
  const progress = Math.min(
    Math.round(
      Big(filled)
        .mul(100)
        .div(Big(amount).eq(0) ? 1 : amount)
        .toNumber(),
    ),
    100,
  )

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent className="space-y-0">
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>

        <SheetRoot.SheetBody>
          <div className="flex items-center space-x-2">
            <TokenPair
              titleProps={{
                variant: "title3",
                className: "text-sm text-current font-normal",
                as: "span",
              }}
              tokenClasses="h-8 w-8"
              baseToken={market?.base}
              quoteToken={market?.quote}
            />
          </div>
          <SheetLine
            title="Status"
            item={
              <div
                className={cn(
                  "capitalize flex items-center space-x-1 px-2 py-0.5 rounded",
                  isFilled
                    ? "text-green-caribbean bg-primary-dark-green"
                    : "text-red-100 bg-red-950 ",
                )}
              >
                {isFilled ? <Check size={15} /> : <Ban size={15} />}
                <span className="pt-0.5">
                  {isFilled ? "Filled" : status.toLowerCase()}
                </span>
              </div>
            }
          />

          {creationDate && (
            <SheetLine
              title="Order Date"
              item={<Text>{new Date(creationDate).toDateString()}</Text>}
              secondaryItem={
                <Text className="text-muted-foreground">
                  {new Date(creationDate).toLocaleTimeString()}
                </Text>
              }
            />
          )}

          <SheetLine
            title="Side"
            item={<Text className={"text-green-caribbean"}>Buy</Text>}
          />

          <SheetLine
            title="Type"
            item={<Text>{isMarketOrder ? "Market" : "Limit"}</Text>}
          />

          <SheetLine
            title="Filled/Amount"
            item={
              <div className={cn("flex items-center")}>
                <span className="text-sm text-muted-foreground">
                  {filled}
                  &nbsp;/
                </span>
                <span className="">
                  &nbsp;
                  {amount} {symbol}
                </span>
              </div>
            }
            secondaryItem={
              <Text className="text-muted-foreground flex items-center space-x-2">
                <CircularProgressBar progress={progress} className="ml-3" />
                <Text>{progress}%</Text>
              </Text>
            }
          />

          <SheetLine title="Price" item={<Text>{price}</Text>} />
        </SheetRoot.SheetBody>
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
