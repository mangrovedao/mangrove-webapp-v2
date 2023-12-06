"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Limit } from "./limit/limit"

enum TradeType {
  LIMIT = "Limit",
  MARKET = "Market",
}

const TRADE_ITEMS = [
  {
    title: TradeType.LIMIT,
    content: <Limit />,
  },
  {
    title: TradeType.MARKET,
    content: <div>TODO</div>,
  },
]

export default function TradeContainer({
  className,
}: React.ComponentProps<"div">) {
  return (
    <div className={className}>
      <CustomTabs defaultValue={TRADE_ITEMS[0]?.title}>
        <CustomTabsList className="w-full py-0 justify-start border-b">
          {TRADE_ITEMS.map(({ title }) => (
            <CustomTabsTrigger key={`${title}-tab`} value={title}>
              {title}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>
        <ScrollArea className="h-[calc(100vh-(var(--bar-height)*3))] overflow-hidden">
          <div className="px-4 space-y-4 mt-[24px]">
            {TRADE_ITEMS.map(({ title, content }) => (
              <CustomTabsContent key={`${title}-tab`} value={title}>
                {content}
              </CustomTabsContent>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CustomTabs>
    </div>
  )
}
