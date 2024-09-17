import { Metadata } from "next"
import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import WarningBanner from "../(shared)/_components/warning-banner"
import { KandelStrategyProvider } from "../[address]/_providers/kandel-strategy"

export const metadata: Metadata = {
  title: "New Strategy | Mangrove DEX",
  description: "New Strategy on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategyProvider>
          <Navbar innerClasses="max-w-8xl mx-auto" />
          <WarningBanner />
          <main className="w-full">{children}</main>
        </KandelStrategyProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
