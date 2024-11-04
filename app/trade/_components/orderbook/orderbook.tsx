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
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { BA } from "@mangrovedao/mgv/lib"
import { SemiBook } from "./semibook"
import { OrderBookTableHead } from "./table-head"
import { Trades } from "./trade-history/trades"
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
        <CustomTabsTrigger value={"trades"}>Trades</CustomTabsTrigger>
      </CustomTabsList>
      <CustomTabsContent value="book">
        <div className="p-1 relative h-full">
          <BookContent />
        </div>
      </CustomTabsContent>
      <CustomTabsContent value="trades">
        <div className="p-1 relative h-full">
          <Trades />
        </div>
      </CustomTabsContent>
    </CustomTabs>
  )
}

export function BookContent() {
  const { currentMarket } = useMarket()
  const { bodyRef, scrollAreaRef, spreadRef } = useScrollToMiddle()
  const { book, isLoading } = useBook({
    aggregateOffersWithSamePrice: true,
  })

  if (isLoading || !book || !currentMarket) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center text-green-caribbean" />
    )
  }

  if (book.asks.length === 0 && book.bids.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-4 text-muted-foreground font-ubuntu text-sm font-bold">
        Empty market.
      </div>
    )
  }

  const lowestAskPrice = book.asks[0]?.price
  const highestBidPrice = book.bids[0]?.price
  const spread = Math.abs((lowestAskPrice ?? 0) - (highestBidPrice ?? 0))
  const spreadPercent = (spread / (highestBidPrice ?? 1)) * 100

  const spreadPercentString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(spreadPercent / 100)

  return (
    <div className="-mx-1">
      <div className="text-center text-muted-foreground text-xs border-b py-2">
        Spread:{" "}
        <span className="font-ubuntu">
          {spread?.toFixed(currentMarket.quote.displayDecimals)}
        </span>
      </div>
      <ScrollArea className="h-full" scrollHideDelay={200} ref={scrollAreaRef}>
        <div className="flex">
          <Table className="text-sm leading-5 h-full select-none relative">
            <TableHeader className="sticky top-0 bg-background z-40 py-2 text-xs h-[var(--bar-height)]">
              <TableRow className="border-none">
                <OrderBookTableHead>Total</OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Size ({currentMarket.base.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead>
                  Price ({currentMarket.quote.symbol})
                </OrderBookTableHead>
              </TableRow>
              <TableRow className="border-b absolute top-11 inset-x-3"></TableRow>
            </TableHeader>
            <TableBody className="overflow-scroll" ref={bodyRef}>
              <SemiBook
                type={BA.bids}
                data={book}
                priceDecimals={currentMarket.quote.priceDisplayDecimals}
              />
            </TableBody>
          </Table>
          <Table className="text-sm leading-5 h-full select-none relative">
            <TableHeader className="sticky top-0 bg-background z-40 py-2 text-xs h-[var(--bar-height)]">
              <TableRow className="border-none">
                <OrderBookTableHead>
                  Price ({currentMarket.quote.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Size ({currentMarket.base.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead>Total</OrderBookTableHead>
              </TableRow>
              <TableRow className="border-b absolute top-11 inset-x-3"></TableRow>
            </TableHeader>
            <TableBody className="overflow-scroll" ref={bodyRef}>
              <SemiBook
                type={BA.asks}
                data={book}
                priceDecimals={currentMarket.quote.priceDisplayDecimals}
              />
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </div>
  )
}
