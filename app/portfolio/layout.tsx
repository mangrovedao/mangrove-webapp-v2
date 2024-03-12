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
        <div className="flex flex-col md:flex-row">
          <section className="md:w-[12rem] 2xl:w-[14rem] w-svw md:h-screen border-y md:border-x">
            <Sidebar />
          </section>
          {children}
        </div>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
