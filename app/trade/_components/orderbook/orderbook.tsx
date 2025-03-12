"use client"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableRow } from "@/components/ui/table"

import {
  CustomTabs,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { useUniswapBook } from "@/hooks/use-uniswap-book"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { BA } from "@mangrovedao/mgv/lib"
import { ChevronDown } from "lucide-react"
import { AnimatedOrderBookSkeleton } from "./animated-skeleton"
import { SemiBook } from "./semibook"
import { OrderBookTableHead } from "./table-head"
import { Trades } from "./trade-history/trades"
import useScrollToMiddle from "./use-scroll-to-middle"

// View options for the orderbook
type ViewOption = "default" | "bids" | "asks"

// Wrap the OrderBook component with React.memo to prevent unnecessary re-renders
export const OrderBook = React.memo(function OrderBook({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) {
  const [activeTab, setActiveTab] = useState<"book" | "trades">("book")
  const renderCount = React.useRef(0)

  // Log when the component renders and why
  useEffect(() => {
    renderCount.current += 1
    console.log(`OrderBook rendered (${renderCount.current} times)`)

    return () => {
      console.log("OrderBook unmounted")
    }
  }, [activeTab])

  return (
    <div className={cn("flex flex-col h-full w-full", className)} style={style}>
      <CustomTabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "book" | "trades")
        }
        className="h-full flex flex-col"
      >
        <div className="border-border-tertiary bg-bg-secondary/80 backdrop-blur-sm h-8">
          <CustomTabsList className="w-full p-0 space-x-0 h-full">
            <CustomTabsTrigger
              value="book"
              className={cn("capitalize w-full rounded-none")}
            >
              Order Book
            </CustomTabsTrigger>
            <CustomTabsTrigger
              value="trades"
              className={cn("capitalize w-full rounded-none")}
            >
              Trades
            </CustomTabsTrigger>
          </CustomTabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "book" && <BookContent />}
          {activeTab === "trades" && (
            <div className="h-full bg-bg-secondary/50">
              <Trades className="h-full" />
            </div>
          )}
        </div>
      </CustomTabs>
    </div>
  )
})

// Also memoize the BookContent component
export const BookContent = React.memo(function BookContent() {
  const { currentMarket } = useMarket()
  const { bodyRef, scrollAreaRef, spreadRef, scrollToMiddle } =
    useScrollToMiddle()
  const { data: book, isLoading } = useUniswapBook()
  const [viewOption, setViewOption] = useState<ViewOption>("default")
  const [precision, setPrecision] = useState<number>(1)
  const renderCount = React.useRef(0)

  // Memoize expensive calculations to prevent recalculations on re-renders
  // Must be defined before any conditional returns
  const {
    lowestAskPrice,
    highestBidPrice,
    spread,
    spreadPercent,
    spreadPercentString,
    midPrice,
  } = React.useMemo(() => {
    if (!book || !currentMarket)
      return {
        lowestAskPrice: 0,
        highestBidPrice: 0,
        spread: 0,
        spreadPercent: 0,
        midPrice: 0,
        spreadPercentString: "0%",
      }

    const lowestAskPrice = book.asks[0]?.price || 0
    const highestBidPrice = book.bids[0]?.price || 0
    const spread = Math.abs(lowestAskPrice - highestBidPrice)
    const spreadPercent = (spread / (highestBidPrice || 1)) * 100
    const midPrice = (lowestAskPrice + highestBidPrice) / 2

    const spreadPercentString = new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(spreadPercent / 100)

    return {
      lowestAskPrice,
      highestBidPrice,
      spread,
      spreadPercent,
      midPrice,
      spreadPercentString,
    }
  }, [book, currentMarket])

  // Log when the component renders and why
  useEffect(() => {
    renderCount.current += 1
    console.log(`BookContent rendered (${renderCount.current} times)`, {
      hasBook: !!book,
      isLoading,
      viewOption,
      precision,
    })
  }, [book, isLoading, viewOption, precision])

  if (!book || !currentMarket) {
    return <AnimatedOrderBookSkeleton />
  }

  if (!isLoading && book?.asks.length === 0 && book?.bids.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-4 text-muted-foreground font-ubuntu text-sm font-bold">
        Empty market.
      </div>
    )
  }

  // Function to manually trigger scroll to middle
  const handleScrollToMiddle = () => {
    if (scrollToMiddle) {
      scrollToMiddle()
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary/50">
      {/* View Options and Precision Controls */}
      <div className="flex justify-between items-center px-3 py-1 border-b border-border-tertiary bg-bg-secondary/80 backdrop-blur-sm shadow-sm">
        <div className="flex space-x-2">
          {/* Default View (Both) */}
          <button
            onClick={() => setViewOption("default")}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded transition-all duration-200",
              viewOption === "default"
                ? "bg-background-tertiary shadow-inner"
                : "hover:bg-background-secondary",
            )}
          >
            <div className="flex flex-col">
              <div className="w-4 h-1.5 bg-red-900 mb-0.5 rounded-sm"></div>
              <div className="w-4 h-1.5 bg-green-900 rounded-sm"></div>
            </div>
          </button>

          {/* Asks Only View */}
          <button
            onClick={() => setViewOption("asks")}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded transition-all duration-200",
              viewOption === "asks"
                ? "bg-background-tertiary shadow-inner"
                : "hover:bg-background-secondary",
            )}
          >
            <div className="w-4 h-3 bg-red-900 rounded-sm"></div>
          </button>

          {/* Bids Only View */}
          <button
            onClick={() => setViewOption("bids")}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded transition-all duration-200",
              viewOption === "bids"
                ? "bg-background-tertiary shadow-inner"
                : "hover:bg-background-secondary",
            )}
          >
            <div className="w-4 h-3 bg-green-900 rounded-sm"></div>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Center button */}
          <button
            onClick={handleScrollToMiddle}
            className="text-xs text-muted-foreground hover:text-text-primary transition-colors"
            title="Scroll to middle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Precision Dropdown */}
          <Button
            variant="invisible"
            size="sm"
            className="text-sm font-light flex items-center gap-1 h-6 rounded-full px-3 hover:bg-background-tertiary transition-all duration-200"
            onClick={() => setPrecision((prev) => (prev === 3 ? 0 : prev + 1))}
          >
            {precision}{" "}
            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      {/* Orderbook Content */}
      <div className="flex-1 overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full" type="always">
          {viewOption === "default" && (
            <div className="flex flex-col w-full">
              {/* Asks Table - Only shown in default or asks view */}
              <Table className="text-xs select-none relative w-full">
                <thead className="sticky bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full">
                  <TableRow className="border-none">
                    <OrderBookTableHead>
                      <span className="text-xs">Price</span>
                    </OrderBookTableHead>
                    <OrderBookTableHead className="text-right ">
                      <span className="text-xs">
                        Size ({currentMarket.base.symbol})
                      </span>
                    </OrderBookTableHead>
                    <OrderBookTableHead className="text-right ">
                      <span className="text-xs">
                        Total ({currentMarket.quote.symbol})
                      </span>
                    </OrderBookTableHead>
                  </TableRow>
                </thead>
                <TableBody>
                  <SemiBook
                    type={BA.asks}
                    data={book}
                    priceDecimals={precision}
                  />
                </TableBody>
              </Table>

              {/* Mid Price and Spread */}
              <div
                className="text-center text-muted-foreground text-xs py-1 font-light bg-bg-secondary/90 backdrop-blur-sm shadow-sm"
                ref={spreadRef}
              >
                <span className="font-medium text-text-secondary text-xs">
                  Mid:
                </span>{" "}
                <span className="font-mono font-light text-xs text-white pr-2">
                  {midPrice.toFixed(1)}
                </span>{" "}
                <span className="font-medium text-text-secondary text-xs">
                  Spread:
                </span>{" "}
                <span className="font-mono font-light text-xs text-white">
                  {spreadPercentString}
                </span>
              </div>

              {/* Bids Table */}
              <Table className="text-xs select-none relative w-full -inset-y-6 max-h-fit">
                <thead className="sticky bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full">
                  <TableRow className="border-none invisible">
                    <OrderBookTableHead>
                      <span className="text-xs">Price</span>
                    </OrderBookTableHead>
                    <OrderBookTableHead className="text-right">
                      <span className="text-xs">
                        Size ({currentMarket.base.symbol})
                      </span>
                    </OrderBookTableHead>
                    <OrderBookTableHead className="text-right">
                      <span className="text-xs">
                        Total ({currentMarket.quote.symbol})
                      </span>
                    </OrderBookTableHead>
                  </TableRow>
                </thead>
                <TableBody ref={bodyRef}>
                  <SemiBook
                    type={BA.bids}
                    data={book}
                    priceDecimals={precision}
                  />
                </TableBody>
              </Table>
            </div>
          )}

          {viewOption === "asks" && (
            <Table className="text-xs select-none relative w-full">
              <thead className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full">
                <TableRow className="border-none">
                  <OrderBookTableHead>
                    <span className="text-xs">Price</span>
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    <span className="text-xs">
                      Size ({currentMarket.base.symbol})
                    </span>
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    <span className="text-xs">
                      Total ({currentMarket.quote.symbol})
                    </span>
                  </OrderBookTableHead>
                </TableRow>
              </thead>
              <TableBody>
                <SemiBook
                  type={BA.asks}
                  data={book}
                  priceDecimals={precision}
                />
              </TableBody>
            </Table>
          )}

          {viewOption === "bids" && (
            <Table className="text-xs select-none relative w-full">
              <thead className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full">
                <TableRow className="border-none">
                  <OrderBookTableHead>
                    <span className="text-xs">Price</span>
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    <span className="text-xs">
                      Size ({currentMarket.base.symbol})
                    </span>
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    <span className="text-xs">
                      Total ({currentMarket.quote.symbol})
                    </span>
                  </OrderBookTableHead>
                </TableRow>
              </thead>
              <TableBody>
                <SemiBook
                  type={BA.bids}
                  data={book}
                  priceDecimals={precision}
                />
              </TableBody>
            </Table>
          )}
          <ScrollBar orientation="vertical" className="z-50" />
        </ScrollArea>
      </div>
    </div>
  )
})
