import { Metadata } from "next"
import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import WarningBanner from "../(shared)/_components/warning-banner"

export const metadata: Metadata = {
  title: "Manage Vault | Mangrove DEX",
  description: "Manage Vault on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <Navbar innerClasses="max-w-8xl mx-auto" />
        <WarningBanner />

        <main className="w-full mt-5">{children}</main>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
