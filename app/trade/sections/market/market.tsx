"use client"
import React from "react"

import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ResolutionString } from "@/public/charting_library/charting_library"

export default function Market({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [marketTytpe, setMarketType] = React.useState("Market Chart")

  return (
    <div className={className} {...props}>
      <div className="flex start px-4">
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
      <div className="px-4 h-full">
        <TVChartContainer symbol={"AAPL"} interval={`1D` as ResolutionString} />
      </div>
    </div>
  )
}
