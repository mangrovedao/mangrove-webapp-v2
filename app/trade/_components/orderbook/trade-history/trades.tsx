"use client"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { AnimatedTradesHistorySkeleton } from "./animated-trades-skeleton"
import { useTable } from "./use-table"
import { useTradeHistory } from "./use-trade-history"

export function Trades({ className }: { className?: string }) {
  const { chain } = useAccount()

  const { currentMarket: market } = useMarket()
  const tradesHistoryQuery = useTradeHistory()

  const table = useTable({
    data: tradesHistoryQuery.data,
  })

  const blockExplorerUrl =
    chain?.blockExplorers?.default.url || arbitrum.blockExplorers.default.url

  // Only show loading skeleton when market is not available
  if (!market) {
    return <AnimatedTradesHistorySkeleton />
  }

  // Only show loading state if we're loading and don't have data yet
  const isLoading =
    tradesHistoryQuery.isLoading && !Array.isArray(tradesHistoryQuery.data)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <ScrollArea
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
              `${blockExplorerUrl}/tx/${row.transactionHash}`,
              "_blank",
            )
          }
          cellClasses="py-0.5 text-xs font-light font-serif"
          tableRowClasses="hover:bg-muted/30 cursor-pointer transition-colors h-6"
          animated={true}
          animationVariant="fade"
          emptyArrayMessage="No trades yet"
        />
        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </motion.div>
  )
}
