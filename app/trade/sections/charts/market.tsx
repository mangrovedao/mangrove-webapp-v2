"use client"
import React from "react"

import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ResolutionString } from "@/public/charting_library/charting_library"

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
      <div className="flex w-full text-center">
        <TVChartContainer symbol={"AAPL"} interval={`1D` as ResolutionString} />
      </div>
    </div>
  )
}
