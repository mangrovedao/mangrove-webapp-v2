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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { Check, ChevronDown } from "lucide-react"
import OrderBookV2 from "../orderbookv2/orderbook-v2"
import { Trades } from "../trade-history/trades"
import { AnimatedOrderBookSkeleton } from "./animated-skeleton"
import { OrderBookTableHead } from "./table-head"
import useScrollToMiddle from "./use-scroll-to-middle"

// View options for the orderbook
type ViewOption = "default" | "bids" | "asks"

// Price increment options for filtering the orderbook
const PRICE_INCREMENTS = [0, 0.1, 0.5, 1, 10, 100]

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
    return () => {}
  }, [activeTab])

  const { refetch } = useMergedBooks()

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
          {activeTab === "book" && <OrderBookV2 />}
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
  const [priceIncrement, setPriceIncrement] = useState<number>(0)
  const { mergedBooks: book, isLoading } = useMergedBooks()

  const [viewOption, setViewOption] = useState<ViewOption>("default")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Filter book data based on selected price increment
  const filteredBook = React.useMemo(() => {
    if (!book) return null

    // Safely handle the book data with type assertions
    const asks = Array.isArray(book?.asks) ? [...book.asks] : []
    const bids = Array.isArray(book?.bids) ? [...book.bids] : []

    // Calculate mid price safely
    let midPrice = 0
    if (asks.length > 0 && bids.length > 0) {
      midPrice = ((asks[0]?.price ?? 0) + (bids[0]?.price ?? 0)) / 2
    } else if (asks.length > 0) {
      midPrice = asks[0]?.price ?? 0
    } else if (bids.length > 0) {
      midPrice = bids[0]?.price ?? 0
    }

    return {
      // asks: filterBookByPriceIncrement(asks, priceIncrement, midPrice),
      // bids: filterBookByPriceIncrement(bids, priceIncrement, midPrice),

      asks: book.asks,
      bids: book.bids,
      midPrice,
    }
  }, [book, priceIncrement])

  // Memoize expensive calculations to prevent recalculations on re-renders
  // Must be defined before any conditional returns
  const { spreadPercentString, midPrice } = React.useMemo(() => {
    if (!filteredBook || !currentMarket)
      return {
        lowestAskPrice: 0,
        highestBidPrice: 0,
        spread: 0,
        spreadPercent: 0,
        midPrice: 0,
        spreadPercentString: "0%",
      }

    const lowestAskPrice = filteredBook.asks[0]?.price || 0
    const highestBidPrice = filteredBook.bids[0]?.price || 0
    const spread = Math.abs(lowestAskPrice - highestBidPrice)
    const spreadPercent = (spread / (highestBidPrice || 1)) * 100

    const lowestAsk = filteredBook.asks[0]?.price || 0
    const highestBid = filteredBook.bids[0]?.price || 0

    const absoluteSpread = lowestAsk - highestBid
    const percentSpread =
      highestBid > 0 ? (absoluteSpread / highestBid) * 100 : 0
    const midPrice = (lowestAsk + highestBid) / 2

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
  }, [filteredBook, currentMarket])

  // Determine display precision based on price increment
  const displayPrecision = React.useMemo(() => {
    // Special case for "All" (no filtering)
    if (priceIncrement === 0) {
      return 2 // Default to 2 decimal places for the "All" option
    }

    if (priceIncrement < 1) {
      return Math.abs(Math.floor(Math.log10(priceIncrement)))
    }
    return 0
  }, [priceIncrement])

  // Function to manually trigger scroll to middle
  const handleScrollToMiddle = () => {
    if (scrollToMiddle) {
      scrollToMiddle()
    }
  }

  // Scroll to middle when the component mounts
  useEffect(() => {
    handleScrollToMiddle()
  }, [])

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

  return (
    <div className="flex flex-col h-full bg-bg-secondary/50">
      {/* View Options and Precision Controls */}
      <div className="flex justify-between items-center px-3 py-1 border-b border-border-tertiary bg-bg-secondary/80 backdrop-blur-sm shadow-sm">
        <div className="flex ">
          {/* Default View (Both) */}
          <button
            onClick={() => setViewOption("default")}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 border border-transparent",
              viewOption === "default"
                ? "opacity-100"
                : "hover:bg-bg-secondary/80 opacity-70 hover:opacity-100",
            )}
            title="Show both asks and bids"
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-4 h-1.5 bg-red-900 mb-0.5 rounded-sm transition-all",
                  viewOption === "default" ? "opacity-100" : "opacity-70",
                )}
              ></div>
              <div
                className={cn(
                  "w-4 h-1.5 bg-green-900 rounded-sm transition-all",
                  viewOption === "default" ? "opacity-100" : "opacity-70",
                )}
              ></div>
            </div>
          </button>

          {/* Asks Only View */}
          <button
            onClick={() => setViewOption("asks")}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 border border-transparent",
              viewOption === "asks"
                ? ""
                : "hover:bg-bg-secondary/80 opacity-70 hover:opacity-100",
            )}
            title="Show asks only"
          >
            <div
              className={cn(
                "w-4 h-3 bg-red-900 rounded-sm transition-all",
                viewOption === "asks" ? "opacity-100" : "opacity-70",
              )}
            ></div>
          </button>

          {/* Bids Only View */}
          <button
            onClick={() => setViewOption("bids")}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 border border-transparent",
              viewOption === "bids"
                ? ""
                : "hover:bg-bg-secondary/80 opacity-70 hover:opacity-100",
            )}
            title="Show bids only"
          >
            <div
              className={cn(
                "w-4 h-3 bg-green-900 rounded-sm transition-all",
                viewOption === "bids" ? "opacity-100" : "opacity-70",
              )}
            ></div>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Price Increment Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="invisible"
                size="sm"
                className="text-sm font-light flex items-center gap-1 h-7 rounded-md px-3 hover:bg-bg-secondary/80 transition-all duration-200"
                title="Change price increment"
              >
                <span className="text-xs">
                  {priceIncrement === 0
                    ? "All"
                    : priceIncrement.toLocaleString(undefined, {
                        minimumFractionDigits: priceIncrement < 1 ? 1 : 0,
                        maximumFractionDigits: priceIncrement < 1 ? 1 : 0,
                      })}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isDropdownOpen ? "transform rotate-180" : "",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-bg-secondary border border-border-secondary rounded-md shadow-md w-24"
            >
              {PRICE_INCREMENTS.map((increment) => (
                <DropdownMenuItem
                  key={`increment-${increment}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-1 text-sm cursor-pointer hover:bg-bg-tertiary",
                    priceIncrement === increment
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary",
                  )}
                  onClick={() => setPriceIncrement(increment)}
                >
                  <span className="text-xs">
                    {increment === 0
                      ? "All"
                      : increment.toLocaleString(undefined, {
                          minimumFractionDigits: increment < 1 ? 1 : 0,
                          maximumFractionDigits: increment < 1 ? 1 : 0,
                        })}
                  </span>
                  {priceIncrement === increment && (
                    <Check className="h-3 w-3" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  {/* <SemiBook
                    type={BA.asks}
                    data={filteredBook}
                    priceDecimals={displayPrecision}
                  /> */}
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
                  {midPrice.toFixed(displayPrecision)}
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
                  {/* <SemiBook
                    type={BA.bids}
                    data={filteredBook}
                    priceDecimals={displayPrecision}
                  /> */}
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
                {/* <SemiBook
                  type={BA.asks}
                  data={filteredBook}
                  priceDecimals={displayPrecision}
                /> */}
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
                {/* <SemiBook
                  type={BA.bids}
                  data={filteredBook}
                  priceDecimals={displayPrecision}
                /> */}
              </TableBody>
            </Table>
          )}
          <ScrollBar orientation="vertical" className="z-50" />
        </ScrollArea>
      </div>
    </div>
  )
})
