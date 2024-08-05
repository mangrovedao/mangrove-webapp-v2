import { Metadata } from "next"
import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market.new"

export const metadata: Metadata = {
  title: "Edit Strategy | Mangrove DEX",
  description: "Edit Strategy on Mangrove DEX",
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
