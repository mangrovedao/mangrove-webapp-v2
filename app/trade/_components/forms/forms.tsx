"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { renderElement } from "@/utils/render"
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
  return (
    <CustomTabs
      {...props}
      defaultValue={Object.values(FormType)[0]}
      className={
        "bg-bg-secondary border border-bg-secondary rounded-2xl overflow-hidden"
      }
    >
      <CustomTabsList className="w-full p-0 space-x-0">
        {Object.values(FormType).map((form) => (
          <CustomTabsTrigger
            key={`${form}-tab`}
            value={form}
            className="capitalize w-full data-[state=active]:bg-bg-secondary data-[state=active]:text-text-brand bg-bg-primary rounded-none"
          >
            {form}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <ScrollArea className="overflow-hidden">
        <div className="px-4 space-y-4 mt-[24px]">
          {Object.values(FormType).map((form) => (
            <CustomTabsContent key={`${form}-content`} value={form}>
              {renderElement(TABS_CONTENT[form])}
            </CustomTabsContent>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </CustomTabs>
  )
}
