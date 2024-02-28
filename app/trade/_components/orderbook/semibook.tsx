"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import React from "react"

import { TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/utils"
import { OrderBookTableCell } from "./table-cell"
import { calculateCumulatedVolume } from "./utils"

type SemiBookProps = {
  type: Market.BA
  data?: {
    asks: Market.Offer[]
    bids: Market.Offer[]
  } | null
  priceDecimals: number
}

// interface WindowEventMap {
//   "on-orderbook-offer-clicked": CustomEvent<{ price: string }>
// }

export const SemiBook = React.forwardRef<
  React.ElementRef<typeof TableRow>,
  SemiBookProps
>(({ type, data, priceDecimals }, ref) => {
  const { dataWithCumulatedVolume, maxVolume } = calculateCumulatedVolume(data)
  const offers = dataWithCumulatedVolume?.[type].sort((a, b) =>
    Big(b.price ?? 0)
      .minus(a.price ?? 0)
      .toNumber(),
  )
  const refIndex = type === "bids" ? 0 : offers?.length ? offers.length - 1 : 0

  return (offers ?? []).map(({ price, id, volume, cumulatedVolume }, i) => {
    const cumulatedVolumePercentage = Big(cumulatedVolume ?? 0)
      .mul(100)
      .div(maxVolume ?? 1)
    return (
      <>
        <TableRow
          ref={refIndex === i ? ref : null}
          key={`${type}-${id}`}
          className={`relative h-6 border-none hover:opacity-80 transition-opacity cursor-pointer`}
          onClick={() => {
            dispatchEvent(
              new CustomEvent("on-orderbook-offer-clicked", {
                detail: { price: price.toString() },
              }),
            )
          }}
        >
          <OrderBookTableCell
            className={cn(
              "",
              type === "bids" ? "text-green-caribbean" : "text-red-100",
            )}
          >
            {volume.toFixed(3)}
          </OrderBookTableCell>

          <OrderBookTableCell className="text-right">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger
                  className={cn("hover:opacity-80 transition-opacity ml-1")}
                >
                  <span className="!font-roboto">
                    {price.toFixed(priceDecimals)}
                  </span>
                </TooltipTrigger>
                <TooltipContent> {price.toFixed(8)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </OrderBookTableCell>

          <OrderBookTableCell className="text-gray">
            {price?.mul(volume).toFixed(priceDecimals)}
          </OrderBookTableCell>
          <td
            className={cn(
              "absolute inset-y-[2px] left-0 w-full -z-10 rounded-[2px] order-book-line-bg",
            )}
          ></td>
          <style jsx>{`
            .order-book-line-bg {
              width: ${cumulatedVolumePercentage.toNumber()}%;
              background: ${type === "bids"
                ? "#021B1A"
                : "rgba(255, 0, 0, 0.15)"};
            }
          `}</style>
        </TableRow>
      </>
    )
  })
})

SemiBook.displayName = "SemiBook"
