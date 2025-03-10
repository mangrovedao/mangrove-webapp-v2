"use client"
import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TradeIcon } from "@/svgs"
import { useEffect, useState } from "react"
import { Market } from "./_components/charts/charts"
import { Forms } from "./_components/forms/forms"
import { BookContent, OrderBook } from "./_components/orderbook/orderbook"
import { Trades } from "./_components/orderbook/trade-history/trades"
import { PricesBar } from "./_components/prices-bar/prices-bar"
import { Tables } from "./_components/tables/tables"
import { TradeTabs } from "./_components/trade-tabs/trade-tabs"

export default function Page() {
  const [activeMainTab, setActiveMainTab] = useState("Chart")
  const mainTabs = ["Chart", "Order Book", "Trades"]
  const [isMobile, setIsMobile] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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
    <main className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2">
        <MarketSelector />
        <PricesBar />
      </div>

      {/* Desktop Layout (lg and above) */}
      {!isMobile && (
        <div className="flex-1 flex flex-col pb-2">
          {/* Top section with Chart, OrderBook, and Forms */}
          <div className="flex-1 flex gap-2 min-h-0">
            {/* Left section with Chart, OrderBook, and Tables */}
            <div className="flex-[3] flex flex-col">
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Top section with Chart and OrderBook */}
                <ResizablePanel defaultSize={70} minSize={30} className="pb-2">
                  <div className="flex gap-2 h-full">
                    {/* Chart Section */}
                    <div className="flex-[3] rounded-sm overflow-hidden border border-bg-secondary">
                      <Market className="w-full h-full" />
                    </div>

                    {/* Order Book Section */}
                    <div className="w-[320px] rounded-sm overflow-hidden flex flex-col border border-bg-secondary">
                      <OrderBook className="flex-1 w-full min-h-0" />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle className="bg-transparent" withHandle />

                {/* Bottom section with Tables */}
                <ResizablePanel
                  defaultSize={30}
                  minSize={15}
                  className="rounded-sm border border-bg-secondary h-full w-full"
                >
                  <Tables className="h-full w-full" />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Trading Forms Section - Right */}
            <div className="w-[320px] rounded-sm overflow-auto ">
              <Forms className="rounded-sm " />
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
          <div className="flex-1 border-border-tertiary flex flex-col gap-2">
            {activeMainTab === "Chart" && (
              <>
                <div className="flex-1 w-full rounded-sm">
                  <Market className="w-full h-full" />
                </div>
              </>
            )}
            {activeMainTab === "Order Book" && (
              <>
                <div className="flex-1 mx-auto w-full border border-bg-secondary rounded-sm">
                  <BookContent />
                </div>
              </>
            )}
            {activeMainTab === "Trades" && (
              <>
                <div className="flex-1 mx-auto w-full p-2 border border-bg-secondary rounded-sm">
                  <Trades className="h-full" />
                </div>
              </>
            )}
            {/* Orders Section - Below Trades */}
            <div className="h-[200px] rounded-sm">
              <Tables className="max-h-[400px]" />
            </div>
          </div>

          {/* Floating Button for Trading Form */}
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-bg-tertiary hover: z-50"
            onClick={() => setIsDrawerOpen(true)}
          >
            <TradeIcon className="w-6 h-6" />
          </Button>

          {/* Trading Form Drawer */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <Drawer.Content className="h-[80vh]">
              <div className="p-4 h-full">
                <Forms />
              </div>
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
      `}</style>

      <style jsx>{`
        main {
          height: calc(100vh - 64px);
        }
      `}</style>
    </main>
  )
}
