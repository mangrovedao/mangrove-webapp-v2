import { Metadata } from "next"
import Script from "next/script"
import React from "react"

import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import {
  MarketProvider,
  MarketProvider as NewMarketProvider,
} from "@/providers/market"

export const metadata: Metadata = {
  title: "Trade | Mangrove DEX",
  description: "Trade on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <NewMarketProvider>
        <IndexerSdkProvider>
          {/* TODO: remove once we got our datafeed */}
          <Script src="/datafeeds/udf/dist/bundle.js" async />
          {children}
        </IndexerSdkProvider>
      </NewMarketProvider>
    </MarketProvider>
  )
}
