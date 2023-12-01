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
}

function SemiBook({ type }: SemiBookProps) {
  const { requestBookQuery } = useMarket()
  const offers = requestBookQuery.data?.[type]
  return (
    <>
      {(offers ?? []).map(({ price, id, volume }) => (
        <TableRow
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
              background: ${type === "bids"
                ? "#021B1A"
                : "rgba(255, 0, 0, 0.15)"};
            }
          `}</style>
        </TableRow>
      ))}
    </>
  )
}

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
        <div className="px-1 relative h-full">
          <ScrollArea className="h-full" scrollHideDelay={200}>
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
              <TableBody className="overflow-scroll">
                <SemiBook type="asks" />
                <SemiBook type="bids" />
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
        </div>
      </CustomTabsContent>
    </CustomTabs>
  )
}
