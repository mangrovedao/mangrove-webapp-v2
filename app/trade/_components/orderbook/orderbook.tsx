"use client"
import Big from "big.js"
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
import useMarket from "@/providers/market"
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
  const { requestBookQuery, market } = useMarket()
  const { bodyRef, scrollAreaRef, spreadRef } = useScrollToMiddle()
  const { asks, bids } = requestBookQuery.data ?? {}
  const highestAskPrice = asks?.[asks.length - 1]?.price
  const lowestAskPrice = asks?.[0]?.price
  const highestBidPrice = bids?.[0]?.price
  const bigestPrice = highestAskPrice ?? highestBidPrice ?? Big(0)
  const spread = lowestAskPrice?.sub(highestBidPrice ?? 0)
  const spreadPercent =
    spread
      ?.mul(100)
      .div(highestBidPrice ?? 1)
      .toNumber() ?? 0
  const spreadPercentString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(spreadPercent / 100)
  const priceDecimals = determinePriceDecimalsFromToken(
    bigestPrice.toNumber(),
    market?.quote,
  )

  if (requestBookQuery.isLoading || !market) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center text-green-caribbean" />
    )
  }

  if (
    requestBookQuery.data?.asks?.length === 0 &&
    requestBookQuery.data?.bids?.length === 0 &&
    !requestBookQuery.isLoading &&
    !!market
  ) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Empty market
      </div>
    )
  }

  return (
    <ScrollArea className="h-full" scrollHideDelay={200} ref={scrollAreaRef}>
      <Table className="text-sm leading-5 h-full select-none relative">
        <TableHeader className="sticky top-0 bg-background z-40 py-2 text-xs h-[var(--bar-height)]">
          <TableRow className="border-none">
            <OrderBookTableHead className="text-left">
              Size ({market?.base.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>
              Price ({market?.quote.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>Total</OrderBookTableHead>
          </TableRow>
          <TableRow className="border-b absolute top-11 inset-x-3"></TableRow>
        </TableHeader>
        <TableBody className="overflow-scroll" ref={bodyRef}>
          <SemiBook
            type="asks"
            data={requestBookQuery.data}
            priceDecimals={market?.quote.displayedDecimals}
          />
          {bids?.length && asks?.length ? (
            <TableRow className="border-none" ref={spreadRef}>
              <OrderBookTableCell className="text-gray">
                Spread
              </OrderBookTableCell>
              <OrderBookTableCell>
                {spread?.toFixed(market.quote.displayedDecimals)}
              </OrderBookTableCell>
              <OrderBookTableCell className="text-gray">
                {spreadPercentString}
              </OrderBookTableCell>
            </TableRow>
          ) : undefined}
          <SemiBook
            type="bids"
            data={requestBookQuery.data}
            priceDecimals={market?.quote.displayedDecimals}
          />
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
