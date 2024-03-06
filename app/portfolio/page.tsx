"use client"

import Metrics from "./_components/value/metrics"
import PortfolioValue from "./_components/value/portfolio-value"

export default function Page() {
  return (
    <main className="w-full">
      <div className="grid w-full grid-cols-3">
        <section className="border-r h-80 col-span-1">
          <PortfolioValue />
        </section>
        <section className="col-span-2">
          <PortfolioValue />
        </section>
        <div className="border-y py-8 col-span-3">
          <Metrics />
        </div>
      </div>
    </main>
  )
}
