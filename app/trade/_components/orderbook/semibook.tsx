"use client"

import { CompleteOffer } from "@mangrovedao/mgv"
import { BA } from "@mangrovedao/mgv/lib"
import React from "react"

import { TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useMarket from "@/providers/market.new"
import { cn } from "@/utils"
import { OrderBookTableCell } from "./table-cell"
import { calculateCumulatedVolume } from "./utils"

type SemiBookProps = {
  type: BA
  data?: {
    asks: CompleteOffer[]
    bids: CompleteOffer[]
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
  const { currentMarket } = useMarket()
  const { dataWithCumulatedVolume, maxVolume } = calculateCumulatedVolume(data)
  const offers = dataWithCumulatedVolume?.[type].sort(
    (a, b) => b.price - a.price,
  )
  const refIndex = type === "bids" ? 0 : offers?.length ? offers.length - 1 : 0

  return (offers ?? []).map((offer, i) => {
    const { price, id, volume, cumulatedVolume } = offer
    const cumulatedVolumePercentage =
      ((cumulatedVolume ?? 0) * 100) / (maxVolume ?? 1)

    const pDecimals =
      currentMarket?.quote.symbol === "WETH" &&
      currentMarket?.base.symbol === "BLAST"
        ? 8
        : priceDecimals

    return (
      <>
        <TableRow
          ref={refIndex === i ? ref : null}
          key={`${type}-${id}`}
          className={`z-50 relative h-6 border-none hover:opacity-80 transition-opacity cursor-pointer`}
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
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger
                  className={cn("hover:opacity-80 transition-opacity ml-1")}
                >
                  <span className="!font-roboto">
                    {volume.toFixed(pDecimals)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="">
                  {volume.toFixed(currentMarket?.base.decimals)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </OrderBookTableCell>

          <OrderBookTableCell className="text-right">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger
                  className={cn("hover:opacity-80 transition-opacity ml-1")}
                >
                  <span className="!font-roboto">
                    {price.toFixed(pDecimals)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {" "}
                  {price.toFixed(currentMarket?.quote.decimals)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </OrderBookTableCell>

          <OrderBookTableCell className="text-gray">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger
                  className={cn("hover:opacity-80 transition-opacity ml-1")}
                >
                  <span className="!font-roboto">
                    {(price * volume).toFixed(priceDecimals)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="">
                  {(price * volume).toFixed(currentMarket?.quote.decimals)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </OrderBookTableCell>
          <td
            className={cn(
              "absolute inset-y-[2px] left-0 w-full -z-10 rounded-[2px] order-book-line-bg",
            )}
          ></td>
          <style jsx>{`
            .order-book-line-bg {
              width: ${cumulatedVolumePercentage}%;
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
