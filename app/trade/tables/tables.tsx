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
import { Fills } from "./fills/fills"
import { Orders } from "./orders/orders"

export enum TradeTables {
  FILLS = "fills",
  ORDERS = "orders",
}

const TABS_CONTENT = {
  [TradeTables.FILLS]: Fills,
  [TradeTables.ORDERS]: Orders,
}

export function Tables({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <CustomTabs
      {...props}
      defaultValue={Object.values(TradeTables)[0]}
      className={cn(className)}
    >
      <CustomTabsList className="w-full flex justify-start border-b">
        {Object.values(TradeTables).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
          >
            {table}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <div className="w-full py-4 px-1">
        {Object.values(TradeTables).map((table) => (
          <CustomTabsContent
            key={`${table}-content`}
            value={table}
            style={{ height: "var(--history-table-content-height)" }}
          >
            <ScrollArea className="h-full" scrollHideDelay={200}>
              <div className="px-2">{renderElement(TABS_CONTENT[table])}</div>
              <ScrollBar orientation="vertical" className="z-50" />
              <ScrollBar orientation="horizontal" className="z-50" />
            </ScrollArea>
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
