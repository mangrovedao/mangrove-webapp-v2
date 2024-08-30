"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import useMarket from "@/providers/market.new"
import { OrderBookTableHead } from "./table-head"

export default function Trades() {
  const { currentMarket } = useMarket()

  if (!currentMarket) return null

  return (
    <ScrollArea className="h-full trololo" scrollHideDelay={200}>
      <Table className="text-sm leading-5 h-full select-none relative">
        <TableHeader className="sticky top-0 bg-background z-40 py-2 text-xs h-[var(--bar-height)]">
          <TableRow className="border-none">
            <OrderBookTableHead className="text-left">
              Size ({currentMarket.base.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>
              Price ({currentMarket.quote.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>Time</OrderBookTableHead>
          </TableRow>
          <TableRow className="border-b absolute top-11 inset-x-3"></TableRow>
        </TableHeader>
        <TableBody className="overflow-scroll"></TableBody>
      </Table>
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
