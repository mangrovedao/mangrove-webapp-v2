"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import React from "react"

import { TableRow } from "@/components/ui/table"
import { cn } from "@/utils"
import { OrderBookTableCell } from "./orderbook-table-cell"

type SemiBookProps = {
  type: Market.BA
  offers?: Market.Offer[]
}

export const SemiBook = React.forwardRef<
  React.ElementRef<typeof TableRow>,
  SemiBookProps
>(({ type, offers }, ref) => {
  const refIndex = type === "bids" ? 0 : offers?.length ? offers.length - 1 : 0

  return (offers ?? []).map(({ price, id, volume }, i) => (
    <TableRow
      ref={refIndex === i ? ref : null}
      key={`${type}-${id}`}
      className={`relative h-6 border-none hover:opacity-80 transition-opacity cursor-default`}
    >
      <OrderBookTableCell className="text-left">
        {price?.toFixed(6)}
      </OrderBookTableCell>

      <OrderBookTableCell
        className={cn(
          "",
          type === "bids" ? "text-green-caribbean" : "text-red-100",
        )}
      >
        {volume.toFixed(4)}
      </OrderBookTableCell>
      <OrderBookTableCell className="text-gray">
        {price?.mul(volume).toFixed(2)}
      </OrderBookTableCell>
      <td
        className={cn(
          "absolute inset-y-[2px] left-0 w-full -z-10 rounded-[2px] order-book-line-bg",
        )}
      ></td>
      <style jsx>{`
        .order-book-line-bg {
          width: 100%;
          background: ${type === "bids" ? "#021B1A" : "rgba(255, 0, 0, 0.15)"};
        }
      `}</style>
    </TableRow>
  ))
})

SemiBook.displayName = "SemiBook"
