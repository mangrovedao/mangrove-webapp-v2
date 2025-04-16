"use client"

import React, { Suspense, lazy } from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { useAccount } from "wagmi"

// Lazy load components for better initial load time
const LazyVaults = lazy(() =>
  import("./vaults/vaults").then((mod) => ({ default: mod.Vaults })),
)
const LazyMyVaults = lazy(() =>
  import("./my-vaults/my-vaults").then((mod) => ({ default: mod.MyVaults })),
)

export enum TableTypes {
  VAULTS = "Vaults",
  PORTFOLIO = "My Positions",
}

export function Tables() {
  const { isConnected } = useAccount()
  const [showOnlyActive, setShowOnlyActive] = React.useState(false)
  const [value, setValue] = React.useState<TableTypes>(TableTypes.VAULTS)

  return (
    <div className="space-y-5 w-full h-auto">
      <div className="py-2">
        <Title variant={"title3"} className="text-text-primary">
          Browse vaults
        </Title>
        <Text className="text-text-tertiary text-sm">
          Deposit funds in vaults to earn passive income from trading fees and
          incentives.
        </Text>
      </div>
      <div className="w-full border border-bg-secondary rounded-sm">
        <CustomTabs
          value={value}
          onValueChange={(value) => setValue(value as TableTypes)}
          className="w-full h-full flex flex-col"
        >
          <div className="flex justify-between items-center">
            <CustomTabsList className="flex p-0 justify-start space-x-0 w-full h-8">
              {Object.values(TableTypes).map((tab) => {
                if (!isConnected && tab === TableTypes.PORTFOLIO) return null
                return (
                  <CustomTabsTrigger
                    key={tab}
                    className="capitalize w-full rounded-none"
                    value={tab}
                  >
                    {tab}
                  </CustomTabsTrigger>
                )
              })}
            </CustomTabsList>
          </div>

          <div className="w-full ">
            <Suspense fallback={<TableLoadingSkeleton />}>
              <CustomTabsContent value={TableTypes.VAULTS}>
                <LazyVaults />
              </CustomTabsContent>
              {isConnected && (
                <CustomTabsContent value={TableTypes.PORTFOLIO}>
                  <LazyMyVaults />
                </CustomTabsContent>
              )}
            </Suspense>
          </div>
        </CustomTabs>
      </div>
    </div>
  )
}

// Loading skeleton for tables
export const TableLoadingSkeleton = () => {
  return (
    <div className="space-y-2 p-4">
      <div className="w-full h-5 bg-bg-secondary animate-pulse rounded-sm"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-full h-7 bg-bg-secondary animate-pulse rounded-sm"
        ></div>
      ))}
    </div>
  )
}
