import { Metadata } from "next"
import React from "react"

import { KandelStrategiesProvider } from "@/app/strategies/(list)/_providers/kandel-strategies"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Edit Strategy | Mangrove DEX",
  description: "Edit Strategy on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <main className="w-full">{children}</main>
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
