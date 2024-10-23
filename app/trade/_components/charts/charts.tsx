import React from "react"

import { DepthChart } from "@/app/trade/_components/charts/depth-chart/depth-chart"
import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"

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
    <CustomTabs
      {...props}
      defaultValue={Object.values(ChartType)[0]}
      className={cn("h-full flex flex-col", className)}
    >
      <CustomTabsList className="w-full flex justify-start border-b">
        {Object.values(ChartType).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
          >
            {table}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <div className="w-full p-1 flex-1">
        {Object.values(ChartType).map((chart) => (
          <CustomTabsContent key={`${chart}-content`} value={chart}>
            {renderElement(TABS_CONTENT[chart])}
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
