"use client"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import useMarket from "@/providers/market.new"
import { useAccount } from "wagmi"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useTable } from "./use-table"
import { useTradeHistory } from "./use-trade-history"

export function Trades() {
  const { chain } = useAccount()
  // const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
  //   page: 1,
  //   pageSize: 5,
  // })
  const { currentMarket: market } = useMarket()
  const tradesHistoryQuery = useTradeHistory()

  console.log({ data: tradesHistoryQuery.data })

  const table = useTable({
    data: tradesHistoryQuery.data,
  })

  console.log({ table })

  const blockExplorerUrl = chain?.blockExplorers?.default.url

  return (
    <ScrollArea className="h-full" scrollHideDelay={200}>
      <DataTable
        table={table}
        isError={!!tradesHistoryQuery.error}
        isLoading={tradesHistoryQuery.isLoading || !market}
        onRowClick={(row) =>
          row &&
          row.transactionHash &&
          window.open(`${blockExplorerUrl}/tx/${row.transactionHash}`, "_blank")
        }
        cellClasses="py-0 text-xs"
      />
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
