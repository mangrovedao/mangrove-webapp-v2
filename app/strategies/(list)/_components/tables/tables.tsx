import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"
import { Strategies } from "./strategies/strategies"

enum StrategiesTables {
  // ALL_STRATEGIES = "All strategies",
  MY_STRATEGIES = "My strategies",
}

const TABS_CONTENT = {
  // [StrategiesTables.ALL_STRATEGIES]: <Strategies type="all" />,
  [StrategiesTables.MY_STRATEGIES]: <Strategies type="user" />,
}

export function Tables({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <CustomTabs
      {...props}
      defaultValue={Object.values(StrategiesTables)[0]}
      className={cn(className)}
    >
      <CustomTabsList className="w-full flex justify-start border-b px-0">
        {Object.values(StrategiesTables).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
          >
            {table}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <div className="w-full py-4">
        {Object.values(StrategiesTables).map((table) => (
          <CustomTabsContent key={`${table}-content`} value={table}>
            <ScrollArea className="h-full" scrollHideDelay={200}>
              <div>{renderElement(TABS_CONTENT[table])}</div>
              <ScrollBar orientation="vertical" className="z-50" />
              <ScrollBar orientation="horizontal" className="z-50" />
            </ScrollArea>
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
