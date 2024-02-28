import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useLoadingStore } from "@/stores/loading.store"
import { renderElement } from "@/utils/render"
import { TRADE } from "../../_constants/loading-keys"
import { Fills } from "./fills/fills"
import { useFills } from "./fills/use-fills"
import { AmplifiedOrders } from "./orders/amplified-order"
import { useOrders } from "./orders/hooks/use-orders"
import { Orders } from "./orders/orders"

export enum TradeTables {
  ORDERS = "orders",
  FILLS = "fills",
  AMPLIFIED = "amplified",
}

const TABS_CONTENT = {
  [TradeTables.ORDERS]: Orders,
  [TradeTables.FILLS]: Fills,
  [TradeTables.AMPLIFIED]: AmplifiedOrders,
}

export function Tables(props: React.ComponentProps<typeof CustomTabs>) {
  const [ordersLoading, fillsLoading] = useLoadingStore((state) =>
    state.isLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS]),
  )

  // Get the total count of orders and fills
  const { data: ordersCount } = useOrders({
    select: (orders) => orders.length,
  })
  const { data: fillsCount } = useFills({
    select: (fills) => fills.length,
  })

  return (
    <CustomTabs {...props} defaultValue={Object.values(TradeTables)[0]}>
      <CustomTabsList
        className="w-full flex justify-start border-b"
        loading={ordersLoading ?? fillsLoading}
      >
        {Object.values(TradeTables).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
            count={table === TradeTables.ORDERS ? ordersCount : fillsCount}
          >
            {table}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <div className="w-full py-4 px-1 h-full">
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
