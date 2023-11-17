"use client"
import React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

const data = [
  { volume: 1234.56, price: 0.92, time: 5.0, type: "sell" },
  { volume: 7890.12, price: 0.95, time: 7.0, type: "sell" },
  { volume: 567.89, price: 0.88, time: 15.0, type: "sell" },
  { volume: 2345.67, price: 0.91, time: 18.0, type: "sell" },
  { volume: 9012.34, price: 0.89, time: 9.0, type: "sell" },
  { volume: 4321.0, price: 0.93, time: 3.0, type: "sell" },
  { volume: 10000.0, price: 0.94, time: 12.0, type: "sell" },
  { volume: 8765.43, price: 0.9, time: 20.0, type: "buy" },
  { volume: 987.65, price: 0.88, time: 23.0, type: "buy" },
  { volume: 3456.78, price: 0.96, time: 2.0, type: "buy" },
  { volume: 6789.01, price: 0.88, time: 6.0, type: "buy" },
  { volume: 2109.87, price: 0.89, time: 4.0, type: "buy" },
  { volume: 5432.1, price: 0.97, time: 10.0, type: "buy" },
  { volume: 5432.1, price: 0.97, time: 10.0, type: "buy" },
  { volume: 5432.1, price: 0.97, time: 10.0, type: "buy" },
]

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
  type: "asks" | "bids"
}

function SemiBook({ type }: SemiBookProps) {
  const { requestBookQuery } = useMarket()
  const offers = requestBookQuery.data?.[type]
  return (
    <>
      {(offers || []).map(({ price, id, volume }, i) => (
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

export default function Book({ className }: React.ComponentProps<"div">) {
  return (
    <div className={className}>
      <div className="min-h-[54px] flex items-center">
        <Button variant={"link"}>Book</Button>
      </div>
      <Separator />
      <div className="px-1 overflow-y-scroll h-full">
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
    </div>
  )
}
