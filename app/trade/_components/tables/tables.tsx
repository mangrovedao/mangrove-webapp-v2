import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useLoadingStore } from "@/stores/loading.store"
import { TRADE } from "../../_constants/loading-keys"
import { Fills } from "./fills/fills"
import { useFills } from "./fills/use-fills"

import { useAccount } from "wagmi"
import { useOrders } from "./orders/hooks/use-orders"
import { Orders } from "./orders/orders"

export enum TradeTablesLoggedIn {
  ORDERS = "Open Orders",
  FILLS = "Orders History",
}

export enum TradeTablesLoggedOut {
  ORDERS = "Open Orders",
  FILLS = "Orders History",
}

export function Tables(props: React.ComponentProps<typeof CustomTabs>) {
  const { isConnected } = useAccount()
  const [ordersLoading, fillsLoading] = useLoadingStore((state) =>
    state.isLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS]),
  )
  const [defaultEnum, setDefaultEnum] = React.useState(
    isConnected ? TradeTablesLoggedIn : TradeTablesLoggedOut,
  )
  const [value, setValue] = React.useState<string>(
    Object.values(defaultEnum)[0] || "Open Orders",
  )

  // Get the total count of orders and fills
  const { data: ordersCount } = useOrders({
    select: (orders) => orders.length,
  })

  const { data: fillsCount } = useFills({
    select: (fills) => fills.length,
  })

  React.useEffect(() => {
    setDefaultEnum(isConnected ? TradeTablesLoggedIn : TradeTablesLoggedOut)
    setValue(Object.values(defaultEnum)[0] || "Open Orders")
  }, [isConnected, defaultEnum])

  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full">
      <ResizablePanel
        defaultSize={100}
        minSize={30}
        maxSize={70}
        className="border border-bg-secondary rounded-sm w-full"
      >
        <CustomTabs
          {...props}
          onValueChange={(value) => {
            setValue(value)
          }}
          value={value}
          className="w-full flex flex-col"
        >
          <CustomTabsList
            className="flex justify-start space-x-0 w-full"
            loading={ordersLoading ?? fillsLoading}
          >
            {Object.values(defaultEnum).map((table) => (
              <CustomTabsTrigger
                key={`${table}-tab`}
                value={table}
                className="capitalize w-full rounded-none"
                count={
                  isConnected && table === TradeTablesLoggedIn.ORDERS
                    ? ordersCount
                    : isConnected && table === TradeTablesLoggedIn.FILLS
                      ? fillsCount
                      : 0
                }
              >
                {table}
              </CustomTabsTrigger>
            ))}
          </CustomTabsList>
          <div className="w-full flex-1 overflow-hidden">
            {Object.values(defaultEnum).map((table: string) => (
              <CustomTabsContent
                key={`${table}-content`}
                value={table}
                className="h-full"
              >
                <ScrollArea className="h-full w-full" type="always">
                  <div className="p-2 min-h-full">
                    {table === TradeTablesLoggedIn.ORDERS && isConnected && (
                      <Orders />
                    )}
                    {table === TradeTablesLoggedIn.FILLS && isConnected && (
                      <Fills />
                    )}
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                </ScrollArea>
              </CustomTabsContent>
            ))}
          </div>
        </CustomTabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
