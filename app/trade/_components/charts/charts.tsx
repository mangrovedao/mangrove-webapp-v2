import React from "react"

import { CustomTabs } from "@/components/custom-tabs"
import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { cn } from "@/utils"

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
