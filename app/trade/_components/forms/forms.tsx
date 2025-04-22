"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"

import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import useLocalStorage from "@/hooks/use-local-storage"
import { cn } from "@/utils"
import { motion } from "framer-motion"
import { AnimatedFormsSkeleton } from "./animated-forms-skeleton"
import { Limit } from "./limit/limit"
import { Market } from "./market/market"
import { useTradeFormStore } from "./store"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

// Create persistent component instances
const LimitComponent = React.memo(() => <Limit />)
const MarketComponent = React.memo(() => <Market />)

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  const { isLoading: isGhostBookLoading } = useMergedBooks()
  const [orderType, setOrderType] = useLocalStorage<FormType>(
    "orderType",
    FormType.LIMIT,
  )

  // Access the shared state to ensure it's available
  const { payAmount } = useTradeFormStore()

  const handleTabChange = React.useCallback(
    (value: string) => {
      setOrderType(value as FormType)
    },
    [payAmount, setOrderType],
  )

  if (isGhostBookLoading) {
    return <AnimatedFormsSkeleton />
  }

  return (
    <div className="h-full">
      <CustomTabs
        {...props}
        defaultValue={FormType.LIMIT}
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

        <motion.div
          className="flex-1 p-1.5 overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={orderType}
        >
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
        </motion.div>
      </CustomTabs>
    </div>
  )
}
