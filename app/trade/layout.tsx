import { Metadata } from "next"
import Script from "next/script"
import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Trade | Mangrove DEX",
  description: "Trade on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        {/* TODO: remove once we got our datafeed */}
        <Script src="/datafeeds/udf/dist/bundle.js" async />
        <Navbar />
        {children}
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
