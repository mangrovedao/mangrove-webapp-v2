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

import { useAccount } from "wagmi"
import { BookContent } from "../orderbook/orderbook"
import { Trades } from "../orderbook/trade-history/trades"
import { useOrders } from "./orders/hooks/use-orders"
import { Orders } from "./orders/orders"

export enum TradeTablesLoggedIn {
  BOOK = "Book",
  TRADES = "Trades",
  ORDERS = "Open Orders",
  FILLS = "Orders History",
}

export enum TradeTablesLoggedOut {
  BOOK = "Book",
  TRADES = "Trades",
}

const LOGGED_IN_TABS_CONTENT = {
  [TradeTablesLoggedIn.BOOK]: BookContent,
  [TradeTablesLoggedIn.TRADES]: Trades,
  [TradeTablesLoggedIn.ORDERS]: Orders,
  [TradeTablesLoggedIn.FILLS]: Fills,
}

const LOGGED_OUT_TABS_CONTENT = {
  [TradeTablesLoggedOut.BOOK]: BookContent,
  [TradeTablesLoggedOut.TRADES]: Trades,
}

export function Tables(props: React.ComponentProps<typeof CustomTabs>) {
  const { isConnected } = useAccount()
  const [ordersLoading, fillsLoading] = useLoadingStore((state) =>
    state.isLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS]),
  )
  const [defaultEnum, setDefaultEnum] = React.useState(
    isConnected ? TradeTablesLoggedIn : TradeTablesLoggedOut,
  )
  const [value, setValue] = React.useState(
    Object.values(defaultEnum)[0] || "Book",
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
    setValue(Object.values(defaultEnum)[0] || "Book")
  }, [isConnected])

  return (
    <CustomTabs
      {...props}
      onValueChange={(value) => {
        setValue(value)
      }}
      value={value}
    >
      <CustomTabsList
        className="w-full flex justify-start border-b"
        loading={ordersLoading ?? fillsLoading}
      >
        {Object.values(defaultEnum).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
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
      <div className="w-full pb-4 px-1 h-[calc(100%-var(--bar-height))]">
        {Object.values(defaultEnum).map((table) => (
          <CustomTabsContent key={`${table}-content`} value={table}>
            <ScrollArea className="h-full" scrollHideDelay={200}>
              <div className="px-2 h-full">
                {renderElement(
                  isConnected
                    ? LOGGED_IN_TABS_CONTENT[
                        table as keyof typeof LOGGED_IN_TABS_CONTENT
                      ]
                    : LOGGED_OUT_TABS_CONTENT[
                        table as keyof typeof LOGGED_OUT_TABS_CONTENT
                      ],
                )}
              </div>
              <ScrollBar orientation="vertical" className="z-50" />
              <ScrollBar orientation="horizontal" className="z-50" />
            </ScrollArea>
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
