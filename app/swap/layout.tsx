import { Metadata } from "next"
import React from "react"

import {
  MarketProvider,
  MarketProvider as NewMarketProvider,
} from "@/providers/market"

export const metadata: Metadata = {
  title: "Swap | DEX",
  description: "Swap",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <NewMarketProvider>{children}</NewMarketProvider>
    </MarketProvider>
  )
}
