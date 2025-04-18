import React from "react"

import { DepthChart } from "@/app/trade/_components/charts/depth-chart/depth-chart"
import { CustomTabs } from "@/components/custom-tabs"
import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { cn } from "@/utils"

enum ChartType {
  DEPTH = "Depth chart",
  PRICE = "Price chart",
}

const TABS_CONTENT = {
  [ChartType.DEPTH]: DepthChart,
  [ChartType.PRICE]: <TVChartContainer />,
}

export function Market({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <div {...props} className={cn("h-full flex flex-col", className)}>
      <TVChartContainer />
    </div>
  )
}
