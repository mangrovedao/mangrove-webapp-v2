import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <Navbar innerClasses="max-w-8xl mx-auto" />
        {children}
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
