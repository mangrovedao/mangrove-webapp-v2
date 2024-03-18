import React from "react"

import { Navbar } from "@/components/navbar"
import { IndexerSdkProvider } from "@/providers/mangrove-indexer"
import { MarketProvider } from "@/providers/market"
import Sidebar from "./_components/sidebar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { KandelStrategiesProvider } from "../strategies/(list)/_providers/kandel-strategies"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <MarketProvider>
      <IndexerSdkProvider>
        <KandelStrategiesProvider>
          <Navbar />
          <ScrollArea
            className="min-h-[calc(100vh_-_var(--bar-height))] w-full"
            scrollHideDelay={200}
          >
            <div className="flex flex-col md:flex-row">
              <section className="md:w-[12rem] 2xl:w-[14rem] w-full md:h-screen border-y md:border-x">
                <Sidebar />
              </section>
              {children}
            </div>
            <ScrollBar orientation="vertical" className="z-50" />
          </ScrollArea>
        </KandelStrategiesProvider>
      </IndexerSdkProvider>
    </MarketProvider>
  )
}
