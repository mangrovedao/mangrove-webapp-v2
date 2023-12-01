"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import useScrollToMiddle from "./use-scroll-to-middle"

type TableCellProps = {
  className?: string
} & React.PropsWithChildren

function OrderBookTableHead({ children, className }: TableCellProps) {
  return (
    <TableHead className={cn("p-0 px-[13px] text-right", className)}>
      {children}
    </TableHead>
  )
}

function OrderBookTableCell({ children, className }: TableCellProps) {
  return (
    <TableCell className={cn("p-0 px-[13px] text-right", className)}>
      {children}
    </TableCell>
  )
}

type SemiBookProps = {
  type: Market.BA
  offers?: Market.Offer[]
}

const SemiBook = React.forwardRef<
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
      <OrderBookTableCell
        className={cn(
          "text-left",
          type === "bids" ? "text-green-caribbean" : "text-red-100",
        )}
      >
        {volume.toFixed(2)}
      </OrderBookTableCell>
      <OrderBookTableCell>{price?.toFixed(2)}</OrderBookTableCell>
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

export default function Book({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) {
  const { requestBookQuery } = useMarket()
  const { bodyRef, scrollAreaRef, bestAskRef, bestBidRef } = useScrollToMiddle()

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
        <div className="px-1 relative h-full">
          <ScrollArea
            className="h-full"
            scrollHideDelay={200}
            ref={scrollAreaRef}
          >
            <Table className="text-sm leading-5 h-full select-none">
              <TableHeader className="sticky top-[0] bg-background z-40 p-0 text-xs">
                <TableRow className="border-none">
                  <OrderBookTableHead className="text-left">
                    Size (ETH)
                  </OrderBookTableHead>
                  <OrderBookTableHead>Price (USDC)</OrderBookTableHead>
                  <OrderBookTableHead>Total</OrderBookTableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-scroll" ref={bodyRef}>
                <SemiBook
                  type="asks"
                  ref={bestAskRef}
                  offers={requestBookQuery.data?.asks}
                />
                <SemiBook
                  type="bids"
                  ref={bestBidRef}
                  offers={requestBookQuery.data?.bids}
                />
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
        </div>
      </CustomTabsContent>
    </CustomTabs>
  )
}
