import { Metadata } from "next"
import React from "react"

import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "More | DEX",
  description: "More",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <MarketProvider>{children}</MarketProvider>
}
