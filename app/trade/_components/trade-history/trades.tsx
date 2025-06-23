"use client"
import { motion } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { AnimatedTradesHistorySkeleton } from "./animated-trades-skeleton"
import { parseTradeHistory } from "./schema"
import { useTable } from "./use-table"
import { useTrades, type Trade } from "./use-trade-history"

export function Trades({ className }: { className?: string }) {
  const { defaultChain } = useDefaultChain()
  const { currentMarket: market } = useMarket()
  const scrollRef = useRef<HTMLDivElement>(null)
  const tradesHistoryQuery = useTrades()

  // Process trades data with proper type safety
  const processedTrades = useMemo(() => {
    // Handle the case when data hasn't loaded yet
    if (!tradesHistoryQuery.data) return []

    try {
      // Safely collect all trades from all pages
      const allTrades: Trade[] = []

      // Type assertion to allow accessing pages property
      const pages = (tradesHistoryQuery.data as any).pages || []

      for (const page of pages) {
        if (page && page.data && Array.isArray(page.data)) {
          allTrades.push(...page.data)
        }
      }

      return parseTradeHistory({ trades: allTrades })
    } catch (error) {
      console.error("Error processing trades data:", error)
      return []
    }
  }, [tradesHistoryQuery.data])

  const table = useTable({ data: processedTrades })

  // Setup scroll listener to detect when user scrolls to bottom
  useEffect(() => {
    const scrollContainer = scrollRef.current

    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer

      // If scrolled to bottom (with a 20px threshold)
      if (scrollHeight - scrollTop - clientHeight < 20) {
        if (
          tradesHistoryQuery.hasNextPage &&
          !tradesHistoryQuery.isFetchingNextPage
        ) {
          tradesHistoryQuery.fetchNextPage()
        }
      }
    }

    scrollContainer.addEventListener("scroll", handleScroll)

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [
    tradesHistoryQuery.hasNextPage,
    tradesHistoryQuery.isFetchingNextPage,
    tradesHistoryQuery.fetchNextPage,
  ])

  // Only show loading skeleton when market is not available
  if (!market || !table?.getRowModel()?.rows?.length) {
    return <AnimatedTradesHistorySkeleton />
  }

  // Only show loading state if we're loading and don't have data yet
  const isLoading = tradesHistoryQuery.isLoading

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <ScrollArea
        ref={scrollRef}
        className={cn("h-[calc(100%-1.5rem)]", className)}
        scrollHideDelay={200}
      >
        <DataTable
          table={table}
          isError={false} // Never show error since we're using mock data as fallback
          isLoading={isLoading}
          onRowClick={(row) =>
            row &&
            row.transactionHash &&
            window.open(
              `${defaultChain.blockExplorers?.default.url}/tx/${row.transactionHash}`,
              "_blank",
            )
          }
          cellClasses="py-0.5 text-xs font-light font-serif"
          tableRowClasses="hover:bg-muted/30 cursor-pointer transition-colors h-6"
          animated={true}
          animationVariant="fade"
          emptyArrayMessage="No trades yet"
        />
        {tradesHistoryQuery.isFetchingNextPage && (
          <div className="py-2 text-center text-xs opacity-70">
            Loading more trades...
          </div>
        )}
        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </motion.div>
  )
}
