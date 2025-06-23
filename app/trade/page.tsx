"use client"
import { useEffect, useState } from "react"

import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useUpdatePageTitle } from "@/hooks/use-update-page-title"
import useMarket from "@/providers/market"
import { TradeIcon } from "@/svgs"
import EmbedPriceChart from "./_components/charts/embed-price-chart/embed-price-chart"
import { Forms } from "./_components/forms/forms"
import { OrderBook } from "./_components/orderbook/orderbook"
import OrderBookV2 from "./_components/orderbookv2/orderbook-v2"
import { PricesBar } from "./_components/prices-bar/prices-bar"
import { Tables } from "./_components/tables/tables"
import { Trades } from "./_components/trade-history/trades"
import { TradeTabs } from "./_components/trade-tabs/trade-tabs"

export default function Page() {
  const [activeMainTab, setActiveMainTab] = useState("Chart")
  const mainTabs = ["Chart", "Order Book", "Trades"]
  const [isMobile, setIsMobile] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { currentMarket } = useMarket()
  const { spotPrice } = useMergedBooks()

  // Update the browser tab title with token price information
  useUpdatePageTitle({
    spotPrice,
    baseToken: currentMarket?.base,
    quoteToken: currentMarket?.quote,
    suffix: "Trade | Oxium DEX",
  })

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return (
    <main className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-4">
        <MarketSelector />
        <PricesBar />
      </div>

      {/* Desktop Layout (lg and above) */}
      {!isMobile && (
        <div className="flex-1 flex flex-col pb-2">
          {/* Top section with Chart, OrderBook, and Forms */}
          <div className="flex-1 flex gap-1 min-h-0">
            {/* Left section with Chart, OrderBook, and Tables */}
            <div className="flex-[4] flex flex-col">
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Top section with Chart and OrderBook */}
                <ResizablePanel defaultSize={75} minSize={30} className="pb-1">
                  <div className="flex gap-1 h-full">
                    {/* Chart Section */}
                    <div className="flex-[4] rounded-sm overflow-hidden border border-bg-secondary">
                      <EmbedPriceChart />
                    </div>

                    {/* Order Book Section */}
                    <div className="w-[300px] rounded-sm overflow-hidden flex flex-col border border-bg-secondary">
                      <OrderBook className="flex-1 w-full min-h-0" />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle className="bg-transparent" withHandle />

                {/* Bottom section with Tables */}
                <ResizablePanel
                  defaultSize={25}
                  minSize={15}
                  className="rounded-sm border border-bg-secondary h-full w-full"
                >
                  <Tables className="h-full w-full" />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Trading Forms Section - Right */}
            <div className="w-[280px] rounded-sm overflow-auto">
              <Forms className="rounded-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex-1 flex flex-col gap-2">
          {/* Main Tab Navigation */}
          <TradeTabs
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            className="mx-auto w-full"
          />

          {/* Main Tab Content */}
          <div className="flex-1 border-border-tertiary flex flex-col">
            {/* Main content area */}
            <div className="mb-2">
              {activeMainTab === "Chart" && (
                <div className="h-[400px] w-full rounded-sm border border-bg-secondary">
                  <EmbedPriceChart />
                </div>
              )}
              {activeMainTab === "Order Book" && (
                <div className="h-[400px] w-full border border-bg-secondary rounded-sm">
                  <OrderBookV2 />
                </div>
              )}
              {activeMainTab === "Trades" && (
                <div className="h-[400px] w-full p-2 border border-bg-secondary rounded-sm">
                  <Trades className="h-full" />
                </div>
              )}
            </div>

            {/* Tables section with fixed height */}
            <div className="border border-bg-secondary rounded-sm h-[360px]">
              <Tables className="w-full h-full" />
            </div>
          </div>

          {/* Floating Button for Trading Form */}
          <Button
            className="flex items-center justify-center fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-bg-tertiary hover: z-50 hover:bg-bg-primary-hover hover:border-bg-bg-primary hover:border-2"
            onClick={() => setIsDrawerOpen(true)}
          >
            <TradeIcon className="pl-[0.6px] w-6 h-6" />
          </Button>

          {/* Trading Form Drawer */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <Drawer.Content className=" p-4">
              <Forms />
            </Drawer.Content>
          </Drawer>
        </div>
      )}

      <style jsx global>{`
        body {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          body {
            position: relative;
            overflow: auto;
          }
        }
      `}</style>

      <style jsx>{`
        main {
          height: calc(100vh - 60px);
        }

        @media (max-width: 1024px) {
          main {
            min-height: calc(100vh - 60px);
            height: auto;
            overflow-y: auto;
          }
        }

        @media (max-width: 1366px) {
          /* Adjustments for smaller screens like 13" */
          main {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </main>
  )
}
