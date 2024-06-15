"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market.new"
import { cn } from "@/utils"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { SemiBook } from "./semibook"
import { OrderBookTableCell } from "./table-cell"
import { OrderBookTableHead } from "./table-head"
import useScrollToMiddle from "./use-scroll-to-middle"

export function OrderBook({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) {
  return (
    <CustomTabs
      style={style}
      defaultValue={"book"}
      className={cn("h-full", className)}
    >
      <CustomTabsList className="w-full flex justify-start border-b">
        <CustomTabsTrigger value={"book"}>Book</CustomTabsTrigger>
      </CustomTabsList>
      <CustomTabsContent value="book">
        <div className="p-1 relative h-full">
          <BookContent />
        </div>
      </CustomTabsContent>
    </CustomTabs>
  )
}

function BookContent() {
  // const { requestBookQuery, market } = useMarket()
  // const market = useMarket()
  const { currentMarket } = useMarket()
  const { bodyRef, scrollAreaRef, spreadRef } = useScrollToMiddle()
  const { book, isLoading, isError } = useBook()
  // const { asks, bids } = requestBookQuery.data ?? {}

  if (isLoading || !book || !currentMarket) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center text-green-caribbean" />
    )
  }

  if (book.asks.length === 0 && book.bids.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Empty market
      </div>
    )
  }

  const highestAskPrice = book.asks[book.asks.length - 1]?.price
  const lowestAskPrice = book.asks[0]?.price
  const highestBidPrice = book.bids[0]?.price
  const bigestPrice = highestAskPrice ?? highestBidPrice ?? 0
  const spread = Math.abs((lowestAskPrice ?? 0) - (highestBidPrice ?? 0))
  const spreadPercent = (spread / (highestBidPrice ?? 1)) * 100
  console.log(book)
  // const bigestPrice = highestAskPrice ?? highestBidPrice ?? Big(0)
  // const spread = lowestAskPrice?.sub(highestBidPrice ?? 0).abs()
  // const spreadPercent =
  //   spread
  //     ?.mul(100)
  //     .div(highestBidPrice ?? 1)
  //     .toNumber() ?? 0
  const spreadPercentString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(spreadPercent / 100)
  const priceDecimals = determinePriceDecimalsFromToken(bigestPrice)

  return (
    <ScrollArea className="h-full" scrollHideDelay={200} ref={scrollAreaRef}>
      <Table className="text-sm leading-5 h-full select-none relative">
        <TableHeader className="sticky top-0 bg-background z-40 py-2 text-xs h-[var(--bar-height)]">
          <TableRow className="border-none">
            <OrderBookTableHead className="text-left">
              Size ({currentMarket.base.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>
              Price ({currentMarket.quote.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>Total</OrderBookTableHead>
          </TableRow>
          <TableRow className="border-b absolute top-11 inset-x-3"></TableRow>
        </TableHeader>
        <TableBody className="overflow-scroll" ref={bodyRef}>
          <SemiBook
            type="asks"
            data={book}
            priceDecimals={currentMarket.quote.priceDisplayDecimals}
          />
          {book.bids.length && book.asks.length ? (
            <TableRow className="border-none" ref={spreadRef}>
              <OrderBookTableCell className="text-gray">
                Spread
              </OrderBookTableCell>
              <OrderBookTableCell>
                {spread?.toFixed(currentMarket.quote.displayDecimals)}
              </OrderBookTableCell>
              <OrderBookTableCell className="text-gray">
                {spreadPercentString}
              </OrderBookTableCell>
            </TableRow>
          ) : undefined}
          <SemiBook
            type="bids"
            data={book}
            priceDecimals={currentMarket.quote.priceDisplayDecimals}
          />
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
