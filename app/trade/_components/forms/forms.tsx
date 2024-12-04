"use client"
import { BS } from "@mangrovedao/mgv/lib"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBook } from "@/hooks/use-book"
import useLocalStorage from "@/hooks/use-local-storage"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"
import { Buy } from "./form-types/buy"
import { Sell } from "./form-types/sell"

const TABS_CONTENT = {
  [BS.sell]: Sell,
  [BS.buy]: Buy,
}

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  const { book } = useBook()
  const [orderType, setOrderType] = useLocalStorage<BS | null>(
    "orderType",
    null,
  )

  return book ? (
    <CustomTabs
      {...props}
      defaultValue={orderType ?? Object.values(BS)[0]}
      className={
        "bg-bg-secondary border border-bg-secondary rounded-2xl h-full max-h-fit"
      }
      onValueChange={(value) => setOrderType(value as BS)}
    >
      <CustomTabsList className="w-full p-0 space-x-0">
        {Object.values(BS).map((form) => (
          <CustomTabsTrigger
            key={`${form}-tab`}
            value={form}
            className={cn(
              "capitalize w-full data-[state=active]:bg-bg-secondary data-[state=active]:text-text-brand bg-bg-primary rounded-none",
              {
                "data-[state=active]:border-[#FF5555] data-[state=active]:text-[#FF5555] rounded-tr-2xl":
                  form === BS.sell,
                "rounded-tl-2xl": form === BS.buy,
              },
            )}
          >
            {form}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <ScrollArea
        scrollHideDelay={200}
        className="max-h-[calc(100%-var(--bar-height))] h-full"
      >
        <div className="px-4 space-y-4 mt-[24px]">
          {Object.values(BS).map((form) => (
            <CustomTabsContent key={`${form}-content`} value={form}>
              {book ? (
                renderElement(TABS_CONTENT[form])
              ) : (
                <Skeleton className="w-full h-full" />
              )}
            </CustomTabsContent>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </CustomTabs>
  ) : (
    <Skeleton className="w-full h-full" />
  )
}
