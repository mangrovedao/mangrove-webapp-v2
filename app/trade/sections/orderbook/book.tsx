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

const calculateBackgroundColor = (volume: number, type: string) => {
  const widthPercentage = (volume / 10000) * 100

  return `linear-gradient(to left, ${
    type === "buy" ? "#052e16" : "#450a0a"
  } ${widthPercentage}%, transparent ${widthPercentage}%)`
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size (ETH)</TableHead>
              <TableHead>Price (USDC)</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(({ price, time, volume, type }, i) => (
              <TableRow
                key={`order-book-${i}`}
                className={`text-center hover:opacity-90`}
                style={{ background: calculateBackgroundColor(volume, type) }}
              >
                <TableCell>{volume}</TableCell>
                <TableCell>{price}</TableCell>
                <TableCell>{time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
