import { Metadata } from "next"
import React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import {
  MarketProvider,
  MarketProvider as NewMarketProvider,
} from "@/providers/market"

export const metadata: Metadata = {
  title: "Rewards | Mangrove DEX",
  description: "Rewards on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <NewMarketProvider>
        <TooltipProvider>
          <IndexerSdkProvider>{children}</IndexerSdkProvider>
        </TooltipProvider>
      </NewMarketProvider>
    </MarketProvider>
  )
}
