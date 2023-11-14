"use client"
import React from "react"

import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
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
import { ResolutionString } from "@/public/charting_library/charting_library"

const data = [
  {
    date: "10.03.2020",
    side: "sell",
    type: "Market",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "filled",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Limit",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Amplified",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Stop",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
]

export default function Market() {
  const [marketTytpe, setMarketType] = React.useState("Market Chart")

  return (
    <div>
      <div className="flex start">
        <Button
          variant={"link"}
          onClick={() => setMarketType("Market Chart")}
          className={`${marketTytpe === "Market Chart" && `underline`}`}
        >
          Market Chart
        </Button>
        <Button
          variant={"link"}
          onClick={() => setMarketType("Depth Chart")}
          className={`${marketTytpe === "Depth Chart" && `underline`}`}
        >
          Depth Chart
        </Button>
      </div>
      <Separator />
      {/* @Anas note: added p-0.5 because in some cases the chart goes outside of the div */}
      <div className="p-0.5">
        <TVChartContainer symbol={"AAPL"} interval={`1D` as ResolutionString} />
      </div>
      <div className="m-5 flex space-x-5">
        <span>Open Orders (0)</span>
        <span>History (0)</span>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount/Filled</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(({ date, side, type, amount, price, status }, i) => (
              <TableRow key={`trading-market-${i}`}>
                <TableCell>{date}</TableCell>
                <TableCell>{side}</TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>{amount}</TableCell>
                <TableCell>{price}</TableCell>
                <TableCell>{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
