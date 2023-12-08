import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"
import { Orders } from "./orders/orders"

export enum TradeTables {
  ORDERS = "orders",
  FILLS = "fills",
}

const TABS_CONTENT = {
  [TradeTables.ORDERS]: Orders,
  [TradeTables.FILLS]: <div>TODO</div>,
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
      <div className="h-full w-full px-2 py-4">
        {Object.values(TradeTables).map((table) => (
          <CustomTabsContent key={`${table}-content`} value={table}>
            {renderElement(TABS_CONTENT[table])}
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
