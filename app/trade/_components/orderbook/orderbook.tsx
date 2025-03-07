"use client"
import { motion } from "framer-motion"
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
    <motion.div
      style={style}
      // className={cn("flex flex-col rounded-sm overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <CustomTabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "book" | "trades")
        }
        // className="w-full h-full"
        className={"border border-bg-secondary rounded-sm h-full max-h-fit"}
      >
        <motion.div
          className="border-b border-border-tertiary bg-bg-secondary/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CustomTabsList className="w-full p-0 space-x-0">
            <CustomTabsTrigger
              value="book"
              className={cn(
                "capitalize w-full data-[state=inactive]:bg-transparent data-[state=active]:text-text-primary data-[state=active]:border-b-primary/80 bg-bg-secondary rounded-none",
              )}
            >
              Order Book
            </CustomTabsTrigger>
            <CustomTabsTrigger
              value="trades"
              className={cn(
                "capitalize w-full data-[state=inactive]:bg-transparent data-[state=active]:text-text-primary data-[state=active]:border-b-primary/80 bg-bg-secondary rounded-none",
              )}
            >
              Trades
            </CustomTabsTrigger>
          </CustomTabsList>
        </motion.div>

        {activeTab === "book" && <BookContent />}
        {activeTab === "trades" && (
          <motion.div
            className="p-2 h-full bg-bg-secondary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Trades />
          </motion.div>
        )}
      </CustomTabs>
    </motion.div>
  )
})

// Also memoize the BookContent component
export const BookContent = React.memo(function BookContent() {
  const { currentMarket } = useMarket()
  const { bodyRef, scrollAreaRef, spreadRef } = useScrollToMiddle()
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
    midPrice,
    spreadPercentString,
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
      <motion.div
        className="w-full h-full flex justify-center items-center mt-4 text-muted-foreground font-ubuntu text-sm font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Empty market.
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col h-full bg-bg-secondary/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* View Options and Precision Controls */}
      <motion.div
        className="flex justify-between items-center px-4 py-2 border-b border-border-tertiary bg-bg-secondary/80 backdrop-blur-sm shadow-sm"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
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

        {/* Precision Dropdown */}
        <div className="flex items-center">
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
      </motion.div>

      {/* Orderbook Content */}
      <ScrollArea
        className="flex-1 min-h-0"
        scrollHideDelay={200}
        ref={scrollAreaRef}
      >
        {viewOption === "default" && (
          <div className="flex flex-col w-full">
            {/* Asks Table - Only shown in default or asks view */}
            <Table className="text-sm leading-5 select-none relative w-full">
              <motion.thead
                className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <TableRow className="border-none">
                  <OrderBookTableHead className="font-sans text-xs">
                    Price ({currentMarket.quote.symbol})
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right font-sans text-xs">
                    Size ({currentMarket.base.symbol})
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right font-sans text-xs">
                    Total ({currentMarket.quote.symbol})
                  </OrderBookTableHead>
                </TableRow>
              </motion.thead>
              <TableBody className="overflow-scroll pt-5">
                <SemiBook
                  type={BA.asks}
                  data={book}
                  priceDecimals={precision}
                />
              </TableBody>
            </Table>

            {/* Mid Price and Spread */}
            <motion.div
              className="text-center text-muted-foreground text-xs py-1 font-light bg-bg-secondary/90 backdrop-blur-sm shadow-sm "
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
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
            </motion.div>

            {/* Bids Table */}
            <Table className="text-sm leading-5 select-none relative w-full">
              <motion.thead
                className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <TableRow className="border-none">
                  <OrderBookTableHead>
                    Price ({currentMarket.quote.symbol})
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    Size ({currentMarket.base.symbol})
                  </OrderBookTableHead>
                  <OrderBookTableHead className="text-right">
                    Total ({currentMarket.quote.symbol})
                  </OrderBookTableHead>
                </TableRow>
              </motion.thead>
              <TableBody className="overflow-scroll" ref={bodyRef}>
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
          <Table className="text-sm leading-5 select-none relative w-full">
            <motion.thead
              className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-full"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <TableRow className="border-none">
                <OrderBookTableHead>
                  Price ({currentMarket.quote.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Size ({currentMarket.base.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Total ({currentMarket.quote.symbol})
                </OrderBookTableHead>
              </TableRow>
            </motion.thead>
            <TableBody className="overflow-scroll">
              <SemiBook type={BA.asks} data={book} priceDecimals={precision} />
            </TableBody>
          </Table>
        )}

        {viewOption === "bids" && (
          <Table className="text-sm leading-5 select-none relative w-full">
            <motion.thead
              className="sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-40 py-2 text-xs h-[var(--bar-height)]"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <TableRow className="border-none">
                <OrderBookTableHead>
                  Price ({currentMarket.quote.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Size ({currentMarket.base.symbol})
                </OrderBookTableHead>
                <OrderBookTableHead className="text-right">
                  Total ({currentMarket.quote.symbol})
                </OrderBookTableHead>
              </TableRow>
            </motion.thead>
            <TableBody className="overflow-scroll">
              <SemiBook type={BA.bids} data={book} priceDecimals={precision} />
            </TableBody>
          </Table>
        )}

        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </motion.div>
  )
})
