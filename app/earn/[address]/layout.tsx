import { Metadata } from "next"
import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Manage Vault | Mangrove DEX",
  description: "Manage Vault on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <main className="w-full mt-5">{children}</main>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
