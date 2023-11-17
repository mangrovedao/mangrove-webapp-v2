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

export default function Book() {
  const [marketTytpe, setMarketType] = React.useState("Book")

  return (
    <div className="grid">
      <div className="flex start">
        <Button
          variant={"link"}
          className={`${marketTytpe === "Book" && `underline`}`}
          onClick={() => setMarketType("Book")}
        >
          Book
        </Button>
        <Button
          variant={"link"}
          className={`${marketTytpe === "Trades" && `underline`}`}
          onClick={() => setMarketType("Trades")}
        >
          Trades
        </Button>
      </div>
      <Separator />
      <div>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <OrderBookTableHead className="text-left">
                Size (ETH)
              </OrderBookTableHead>
              <OrderBookTableHead>Price (USDC)</OrderBookTableHead>
              <OrderBookTableHead>Total</OrderBookTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(({ price, time, volume, type }, i) => (
              <TableRow
                key={`order-book-${i}`}
                className={`relative h-6 border-none`}
              >
                <OrderBookTableCell
                  className={cn(
                    "text-left",
                    type === "buy" ? "text-green" : "text-red",
                  )}
                >
                  {volume}
                </OrderBookTableCell>
                <OrderBookTableCell>{price}</OrderBookTableCell>
                <OrderBookTableCell>{time}</OrderBookTableCell>
                <td
                  className={cn(
                    "absolute inset-y-[2px] left-0 w-full -z-10 rounded-r-[2px]",
                    type === "buy" ? "text-green" : "text-red",
                  )}
                  style={{
                    width: `${(volume / 10000) * 100}%`,
                    background:
                      type === "buy" ? "#021B1A" : "rgba(255, 0, 0, 0.15)",
                  }}
                ></td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
