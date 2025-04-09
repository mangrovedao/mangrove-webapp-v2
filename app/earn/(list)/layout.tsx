import { Metadata } from "next"
import React from "react"

import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Strategies | Mangrove DEX",
  description: "Strategies on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <main className="w-full">{children}</main>
    </MarketProvider>
  )
}
