"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { useBook } from "@/hooks/use-book"
import useLocalStorage from "@/hooks/use-local-storage"
import { cn } from "@/utils"
import { BS } from "@mangrovedao/mgv/lib"
import { AnimatedFormsSkeleton } from "./animated-forms-skeleton"
import { Limit } from "./limit/limit"
import { Market } from "./market/market"
import { useTradeFormStore } from "./store"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

// Create persistent component instances
const LimitComponent = React.memo(() => <Limit bs={BS.buy} />)
const MarketComponent = React.memo(() => <Market bs={BS.buy} />)

// Map of form types to components
const FORM_COMPONENTS = {
  [FormType.LIMIT]: LimitComponent,
  [FormType.MARKET]: MarketComponent,
}

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  const { book } = useBook()
  const [orderType, setOrderType] = useLocalStorage<FormType>(
    "orderType",
    FormType.LIMIT,
  )

  // Access the shared state to ensure it's available
  const { payAmount } = useTradeFormStore()

  // Log when the component renders
  console.log("Forms component rendering, orderType:", orderType)

  // Log the current pay amount when switching tabs
  const handleTabChange = React.useCallback(
    (value: string) => {
      console.log("Switching tab to:", value, "Current pay amount:", payAmount)
      setOrderType(value as FormType)
    },
    [payAmount, setOrderType],
  )

  if (!book) {
    return <AnimatedFormsSkeleton />
  }

  return (
    <div className="h-full">
      <CustomTabs
        {...props}
        defaultValue={orderType}
        className="border border-bg-secondary rounded-sm h-full flex flex-col"
        onValueChange={handleTabChange}
      >
        <CustomTabsList className="w-full p-0 space-x-0">
          {Object.values(FormType).map((form) => (
            <CustomTabsTrigger
              key={`${form}-tab`}
              value={form}
              className={cn("capitalize w-full rounded-none")}
            >
              {form}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>

        <div className="flex-1 overflow-hidden p-4">
          <CustomTabsContent value={FormType.LIMIT} className="h-full">
            <div className="h-full">
              <LimitComponent />
            </div>
          </CustomTabsContent>
          <CustomTabsContent value={FormType.MARKET} className="h-full">
            <div className="h-full">
              <MarketComponent />
            </div>
          </CustomTabsContent>
        </div>
      </CustomTabs>
    </div>
  )
}
