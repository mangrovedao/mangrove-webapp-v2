import { Metadata } from "next"
import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Strategies | Mangrove DEX",
  description: "Strategies on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <main className="w-full">{children}</main>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
