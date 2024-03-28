import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import Sidebar from "./_components/sidebar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { KandelStrategiesProvider } from "../strategies/(list)/_providers/kandel-strategies"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio | Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <Navbar />
          <div className="flex flex-col md:flex-row">
            <section className="md:w-[12rem] 2xl:w-[14rem] w-full md:h-screen border-y md:border-x">
              <Sidebar />
            </section>
            <ScrollArea
              className="h-[calc(100vh-(var(--bar-height)))] w-full"
              scrollHideDelay={200}
            >
              {children}
              <ScrollBar orientation="vertical" className="z-50" />
            </ScrollArea>
          </div>
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
