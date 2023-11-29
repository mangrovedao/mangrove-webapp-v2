"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
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
        <TableRow key={`${type}-${id}`} className={`relative h-6 border-none`}>
          <OrderBookTableCell
            className={cn(
              "text-left",
              type === "bids" ? "text-green" : "text-red",
            )}
          >
            {volume.toFixed(2)}
          </OrderBookTableCell>
          <OrderBookTableCell>{price?.toFixed(2)}</OrderBookTableCell>
          <OrderBookTableCell>
            {price?.mul(volume).toFixed(2)}
          </OrderBookTableCell>
          <td
            className={cn(
              "absolute inset-y-[2px] left-0 w-full -z-10 rounded-[2px]",
              type === "bids" ? "text-green" : "text-red",
            )}
            style={{
              width: `${(volume.toNumber() / 10000) * 100}%`,
              background: type === "bids" ? "#021B1A" : "rgba(255, 0, 0, 0.15)",
            }}
          ></td>
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
        <div className="px-1">
          <Table className="text-xs">
            <TableHeader className="sticky top-0">
              <TableRow className="border-none">
                <OrderBookTableHead className="text-left">
                  Size (ETH)
                </OrderBookTableHead>
                <OrderBookTableHead>Price (USDC)</OrderBookTableHead>
                <OrderBookTableHead>Total</OrderBookTableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              <SemiBook type="asks" />
              <SemiBook type="bids" />
            </TableBody>
          </Table>
        </div>
      </CustomTabsContent>
    </CustomTabs>
  )
}
