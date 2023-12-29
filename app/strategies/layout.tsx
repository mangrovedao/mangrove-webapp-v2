import React from "react"

import { Navbar } from "@/components/navbar"
import { KandelStrategiesProvider } from "@/providers/kandel-strategies"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <Navbar innerClasses="max-w-8xl mx-auto" />
          {children}
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
