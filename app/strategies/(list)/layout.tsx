import React from "react"

import { KandelStrategiesProvider } from "@/app/strategies/(list)/_providers/kandel-strategies"
import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <Navbar innerClasses="max-w-8xl mx-auto" />
          <main className="w-full">{children}</main>
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
