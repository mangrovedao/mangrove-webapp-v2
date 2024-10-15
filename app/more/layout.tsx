import { Metadata } from "next"
import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import {
  MarketProvider,
  MarketProvider as NewMarketProvider,
} from "@/providers/market"

export const metadata: Metadata = {
  title: "More | Mangrove DEX",
  description: "More on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <NewMarketProvider>
        <IndexerSdkProvider>{children}</IndexerSdkProvider>
      </NewMarketProvider>
    </MarketProvider>
  )
}
