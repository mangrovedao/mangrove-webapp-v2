"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { renderElement } from "@/utils/render"
import { Limit } from "./limit/limit"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

const TABS_CONTENT = {
  [FormType.LIMIT]: Limit,
  [FormType.MARKET]: <div>TODO</div>,
}

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <CustomTabs
      {...props}
      defaultValue={Object.values(FormType)[0]}
      className={className}
    >
      <CustomTabsList className="w-full py-0 justify-start border-b">
        {Object.values(FormType).map((form) => (
          <CustomTabsTrigger
            key={`${form}-tab`}
            value={form}
            className="capitalize"
          >
            {form}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <ScrollArea className="h-[calc(100vh-(var(--bar-height)*3))] overflow-hidden">
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
