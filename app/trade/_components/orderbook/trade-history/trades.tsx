"use client"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import useMarket from "@/providers/market"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { AnimatedTradesHistorySkeleton } from "./animated-trades-skeleton"
import { useTable } from "./use-table"
import { useTradeHistory } from "./use-trade-history"

export function Trades() {
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
    <ScrollArea className="h-full" scrollHideDelay={200}>
      <DataTable
        table={table}
        isError={!!tradesHistoryQuery.error}
        isLoading={false}
        onRowClick={(row) =>
          row &&
          row.transactionHash &&
          window.open(`${blockExplorerUrl}/tx/${row.transactionHash}`, "_blank")
        }
        cellClasses="py-0 text-xs"
        animated={true}
        animationVariant="fade"
      />
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
