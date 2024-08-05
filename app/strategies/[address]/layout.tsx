import { Metadata } from "next"
import React from "react"

import { KandelStrategyProvider } from "@/app/strategies/[address]/_providers/kandel-strategy"
import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market.new"
import WarningBanner from "../(shared)/_components/warning-banner"

export const metadata: Metadata = {
  title: "Manage Strategy | Mangrove DEX",
  description: "Manage Strategy on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategyProvider>
          <Navbar innerClasses="max-w-8xl mx-auto" />
          <WarningBanner />

          <main className="w-full mt-5">{children}</main>
        </KandelStrategyProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
