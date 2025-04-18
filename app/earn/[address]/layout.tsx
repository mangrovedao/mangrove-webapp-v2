import { Metadata } from "next"
import React from "react"

import { MarketProvider } from "@/providers/market"

export const metadata: Metadata = {
  title: "Manage Vault | Mangrove DEX",
  description: "Manage Vault on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <main className="w-full mt-5">{children}</main>
    </MarketProvider>
  )
}
