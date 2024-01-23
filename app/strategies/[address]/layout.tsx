import React from "react"

import { KandelStrategyProvider } from "@/app/strategies/[address]/_providers/kandel-strategy"
import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import { KandelStrategiesProvider } from "../(list)/_providers/kandel-strategies"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <KandelStrategyProvider>
            <Navbar innerClasses="max-w-8xl mx-auto" />
            <main className="w-full mt-5">{children}</main>
          </KandelStrategyProvider>
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
