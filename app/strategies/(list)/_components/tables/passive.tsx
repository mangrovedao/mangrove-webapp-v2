import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"
import { Flame } from "lucide-react"
import { Vaults } from "./vaults/vaults"

enum StrategiesTables {
  ALL_VAULTS = "All Vault",
  BOOSTED = "Boosted",
  MY_VAULTS = "My vaults",
}

enum SortValues {
  MARKET = "Market",
  LIQUIDITY_SOURCE = "Liquidity source",
  Return = "Return",
}

const TABS_CONTENT = {
  [StrategiesTables.ALL_VAULTS]: <Vaults type="all" />,
  [StrategiesTables.BOOSTED]: <div>TODO</div>,
  [StrategiesTables.MY_VAULTS]: <Vaults type="user" />,
}

export function Passive({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <div>
      <CustomTabs
        {...props}
        defaultValue={Object.values(StrategiesTables)[0]}
        className={cn(className)}
      >
        <CustomTabsList className="w-full flex justify-start border-b px-0">
          {Object.values(StrategiesTables).map((table) => (
            <CustomTabsTrigger
              key={`${table}-tab`}
              value={table}
              className="capitalize"
            >
              {table === StrategiesTables.BOOSTED ? (
                <span className="flex gap-1 align-middle">
                  {table} <Flame className="text-red-300 h-4 w-4" />
                </span>
              ) : (
                table
              )}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>

        <div className="flex gap-4 py-8">
          <SearchInput className="max-w-[535px]" placeholder="Search" />

          <Select
          // onValueChange={handleSortChange}
          // disabled={marketsInfosQuery.isLoading}
          >
            <SelectTrigger className="max-w-[262px]">
              <SelectValue placeholder={"Sort by"} suppressHydrationWarning />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SortValues).map((item, i) => (
                <SelectItem value={item}>
                  <div className="flex items-center space-x-2">{item}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full py-4">
          {Object.values(StrategiesTables).map((table) => (
            <CustomTabsContent key={`${table}-content`} value={table}>
              <ScrollArea className="h-full" scrollHideDelay={200}>
                <div>{renderElement(TABS_CONTENT[table])}</div>
                <ScrollBar orientation="vertical" className="z-50" />
                <ScrollBar orientation="horizontal" className="z-50" />
              </ScrollArea>
            </CustomTabsContent>
          ))}
        </div>
      </CustomTabs>
    </div>
  )
}
