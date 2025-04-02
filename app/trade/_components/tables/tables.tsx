import React from "react"
import { useAccount } from "wagmi"

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
import { OrderHistory } from "./order-history/order-history"
import { useOrderHistory } from "./order-history/use-order-history"
import { useOrders } from "./orders/hooks/use-orders"
import { Orders } from "./orders/orders"

export enum TradeTablesLoggedIn {
  ORDERS = "Open Orders",
  ORDER_HISTORY = "Orders History",
}

export enum TradeTablesLoggedOut {
  ORDERS = "Open Orders",
  ORDER_HISTORY = "Orders History",
}

export function Tables(props: React.ComponentProps<typeof CustomTabs>) {
  const { isConnected } = useAccount()
  const [showAllMarkets, setShowAllMarkets] = React.useState(true)
  const [ordersLoading, orderHistoryLoading] = useLoadingStore((state) =>
    state.isLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY]),
  )
  const [defaultEnum, setDefaultEnum] = React.useState(
    isConnected ? TradeTablesLoggedIn : TradeTablesLoggedOut,
  )
  const [value, setValue] = React.useState<string>(
    Object.values(defaultEnum)[0] || "Open Orders",
  )

  // Get the total count of orders and history
  const { data: orders } = useOrders()
  const ordersCount = React.useMemo(() => {
    if (!orders?.pages) return 0

    return orders.pages.reduce((total, page) => total + page.meta.count, 0)
  }, [orders])

  const { data } = useOrderHistory({
    pageSize: 25,
    allMarkets: true,
  })

  // Calculate the total count from all pages
  const orderHistoryCount = React.useMemo(() => {
    if (!data?.pages) return 0
    return data.pages.reduce((total, page) => total + page.data.length, 0)
  }, [data])

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
          className="w-full h-full flex flex-col"
        >
          <CustomTabsList
            className="flex p-0 justify-start space-x-0 w-full h-8"
            loading={ordersLoading ?? orderHistoryLoading}
          >
            {Object.values(defaultEnum).map((table) => (
              <CustomTabsTrigger
                key={`${table}-tab`}
                value={table}
                className="capitalize w-full rounded-none"
                count={
                  isConnected && table === TradeTablesLoggedIn.ORDERS
                    ? ordersCount
                    : isConnected && table === TradeTablesLoggedIn.ORDER_HISTORY
                      ? orderHistoryCount
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
                <ScrollArea className="h-full w-full" type="auto">
                  <div className="min-h-full p-1">
                    {table === TradeTablesLoggedIn.ORDERS && isConnected && (
                      <Orders
                        showAllMarkets={showAllMarkets}
                        setShowAllMarkets={setShowAllMarkets}
                      />
                    )}
                    {table === TradeTablesLoggedIn.ORDER_HISTORY &&
                      isConnected && (
                        <OrderHistory
                          showAllMarkets={showAllMarkets}
                          setShowAllMarkets={setShowAllMarkets}
                        />
                      )}
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CustomTabsContent>
            ))}
          </div>
        </CustomTabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
