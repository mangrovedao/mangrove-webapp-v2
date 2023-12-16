import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export function TradeProviders({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>{children}</IndexerSdkProvider>
    </MarketProvider>
  )
}
