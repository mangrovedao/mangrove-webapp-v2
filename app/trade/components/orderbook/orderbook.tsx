"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { useAccount } from "wagmi"
import { SemiBook } from "./semibook"
import { OrderBookTableHead } from "./table-head"
import useScrollToMiddle from "./use-scroll-to-middle"

export default function Book({
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
  const { isConnected } = useAccount()
  const { bodyRef, scrollAreaRef, bestAskRef, bestBidRef } = useScrollToMiddle()

  if (!isConnected) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center">
        Connect wallet to see orderbook
      </Skeleton>
    )
  }

  if (requestBookQuery.isLoading || !market) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center text-green-caribbean">
        <Spinner />
      </Skeleton>
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
      <Table className="text-sm leading-5 h-full select-none">
        <TableHeader className="sticky top-[0] bg-background z-40 p-0 text-xs">
          <TableRow className="border-none">
            <OrderBookTableHead className="text-left">
              Size ({market?.base.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>
              Price ({market?.quote.symbol})
            </OrderBookTableHead>
            <OrderBookTableHead>Total</OrderBookTableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-scroll" ref={bodyRef}>
          <SemiBook type="asks" ref={bestAskRef} data={requestBookQuery.data} />
          <SemiBook type="bids" ref={bestBidRef} data={requestBookQuery.data} />
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
