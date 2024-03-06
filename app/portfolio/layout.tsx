import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import Sidebar from "./_components/sidebar"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <Navbar />
        <div className="flex">
          <section className="w-[12rem] h-screen border-x">
            <Sidebar />
          </section>
          {children}
        </div>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
