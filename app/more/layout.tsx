import { Metadata } from "next"
import React from "react"

import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "More | Mangrove DEX",
  description: "More on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <MarketProvider>{children}</MarketProvider>
}
