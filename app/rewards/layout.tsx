import { Metadata } from "next"
import React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  MarketProvider,
  MarketProvider as NewMarketProvider,
} from "@/providers/market"

export const metadata: Metadata = {
  title: "Rewards | DEX",
  description: "Rewards",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <NewMarketProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </NewMarketProvider>
    </MarketProvider>
  )
}
