import React from "react"

import { MarketProvider } from "@/providers/market"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      {children}
      {/* <IndexerSdkProvider>{children}</IndexerSdkProvider> */}
    </MarketProvider>
  )
}
