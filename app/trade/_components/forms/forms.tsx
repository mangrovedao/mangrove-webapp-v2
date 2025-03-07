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
import { renderElement } from "@/utils/render"
import { AnimatedFormsSkeleton } from "./animated-forms-skeleton"
import { Limit } from "./limit/limit"
import { Market } from "./market/market"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

const TABS_CONTENT = {
  [FormType.LIMIT]: Limit,
  [FormType.MARKET]: Market,
}

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  const { book } = useBook()
  const [orderType, setOrderType] = useLocalStorage<FormType | null>(
    "orderType",
    null,
  )

  if (!book) {
    return <AnimatedFormsSkeleton />
  }

  return (
    <CustomTabs
      {...props}
      defaultValue={orderType ?? Object.values(FormType)[0]}
      className="border border-bg-secondary rounded-sm h-full flex flex-col"
      onValueChange={(value) => setOrderType(value as FormType)}
    >
      <CustomTabsList className="w-full p-0 space-x-0">
        {Object.values(FormType).map((form) => (
          <CustomTabsTrigger
            key={`${form}-tab`}
            value={form}
            className={cn(
              "capitalize w-full data-[state=inactive]:bg-transparent data-[state=active]:text-text-primary data-[state=active]:border-b-primary/80 bg-bg-secondary rounded-none",
            )}
          >
            {form}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>

      <div className="flex-1 overflow-hidden p-4">
        {Object.values(FormType).map((form) => (
          <CustomTabsContent
            key={`${form}-content`}
            value={form}
            className="h-full"
          >
            {renderElement(TABS_CONTENT[form])}
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
