"use client"

import Balance from "./_components/value/balance"
import OverviewCharts from "./_components/value/charts"
import Metrics from "./_components/value/metrics"
import OpenOrders from "./_components/value/open-orders"
import PortfolioValue from "./_components/value/portfolio-value"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function Page() {
  return (
    <ScrollArea className="h-screen pb-6" scrollHideDelay={200}>
      <main className="w-full">
        <div className="lg:grid w-full grid-cols-3">
          <section className="border-r h-96 col-span-1">
            <PortfolioValue />
          </section>
          <section className="col-span-2">
            <OverviewCharts />
          </section>
          <div className="border-y py-8 col-span-3">
            <Metrics />
          </div>
          <div className="py-8 col-span-3">
            <Balance />
          </div>
          <div className="py-8 col-span-3">
            <OpenOrders />
          </div>
        </div>
      </main>
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
