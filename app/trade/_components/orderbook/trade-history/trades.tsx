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

  if (tradesHistoryQuery.isLoading || !market) {
    return <AnimatedTradesHistorySkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {/* <div className="mb-1 px-2 flex items-center justify-between">
        <h3 className="text-xs font-normal">Recent Trades</h3>
        <motion.div
          className="text-xs text-muted-foreground font-light"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {tradesHistoryQuery.data?.length || 0} trades
        </motion.div>
      </div> */}
      <ScrollArea
        className={cn("h-[calc(100%-1.5rem)]", className)}
        scrollHideDelay={200}
      >
        <DataTable
          table={table}
          isError={!!tradesHistoryQuery.error}
          isLoading={false}
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
