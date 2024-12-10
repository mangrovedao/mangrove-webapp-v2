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
import useMarket from "@/providers/market"
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

  if (type === "asks") {
    offers?.sort((a, b) => a.price - b.price)
  }

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
      <TableRow
        ref={refIndex === i ? ref : null}
        key={`${type}-${id}`}
        className={`z-30 relative h-6 border-none hover:opacity-80 transition-opacity cursor-pointer`}
        onClick={() => {
          dispatchEvent(
            new CustomEvent("on-orderbook-offer-clicked", {
              detail: { price: price.toString() },
            }),
          )
        }}
      >
        {type === "bids" ? (
          <>
            <OrderBookTableCell className="text-muted-foreground">
              <Cell
                value={price * volume}
                pDecimals={pDecimals}
                priceDecimals={priceDecimals}
              />
            </OrderBookTableCell>
            <OrderBookTableCell>
              <Cell
                value={volume}
                priceDecimals={currentMarket?.base.decimals}
                pDecimals={pDecimals}
              />
            </OrderBookTableCell>
            <OrderBookTableCell
              className={cn(
                "text-right",
                type === "bids" ? "text-green-caribbean" : "text-red-100",
              )}
            >
              <Cell
                value={price}
                priceDecimals={priceDecimals}
                pDecimals={pDecimals}
              />
            </OrderBookTableCell>
          </>
        ) : (
          <>
            <OrderBookTableCell className={cn("text-right", "text-red-100")}>
              <Cell
                value={price}
                priceDecimals={priceDecimals}
                pDecimals={pDecimals}
              />
            </OrderBookTableCell>
            <OrderBookTableCell>
              <Cell
                value={volume}
                priceDecimals={currentMarket?.base.decimals}
                pDecimals={pDecimals}
              />
            </OrderBookTableCell>
            <OrderBookTableCell className="text-muted-foreground">
              <Cell
                value={price * volume}
                pDecimals={pDecimals}
                priceDecimals={priceDecimals}
              />
            </OrderBookTableCell>
          </>
        )}

        <td
          className={cn(
            "absolute inset-y-[2px] w-full -z-10 rounded-[2px] order-book-line-bg",
            type === "bids" ? "right-0" : "left-0",
          )}
        ></td>
        <style jsx>{`
          .order-book-line-bg {
            width: ${cumulatedVolumePercentage}%;
            background: ${type === "bids"
              ? "#003D12"
              : "rgba(255, 0, 0, 0.15)"};
          }
        `}</style>
      </TableRow>
    )
  })
})

function Cell({
  value,
  priceDecimals,
  pDecimals,
}: {
  value: number
  priceDecimals?: number
  pDecimals: number
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          <span className="font-ubuntu text-sm font-semibold">
            {value.toFixed(pDecimals)}
          </span>
        </TooltipTrigger>
        <TooltipContent>{value.toFixed(priceDecimals)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

SemiBook.displayName = "SemiBook"
