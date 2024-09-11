"use client"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { TableCell } from "@/components/ui/table"
import useMarket from "@/providers/market.new"
import { formatDate } from "@/utils/date"
import { useAccount } from "wagmi"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useTable } from "./use-table"
import { useTradeHistory } from "./use-trade-history"

export function Trades() {
  const { chain } = useAccount()
  const { currentMarket: market } = useMarket()
  const tradesHistoryQuery = useTradeHistory()

  const table = useTable({
    data: tradesHistoryQuery.data,
  })

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
        renderExtraRow={(row) => {
          const rowIndex = row.index
          const nextRow = table.getSortedRowModel().rows[rowIndex + 1]

          const { creationDate } = row.original
          const { creationDate: nextCreationDate } = nextRow?.original ?? {}
          if (!nextCreationDate) return null
          const isSameDay =
            nextCreationDate &&
            creationDate.getDate() === nextCreationDate?.getDate()

          if (isSameDay) return null
          return (
            <tr className="relative hidden md:table-row">
              {/* little trick to take the entire table space and create our custom row */}
              {row.getVisibleCells().map((cell, i) => (
                <TableCell key={`${cell.id}-${i}`}>&nbsp;</TableCell>
              ))}
              <div className="border border-mango-300 rounded-lg absolute inset-0 flex items-center p-2 space-x-4 justify-center text-sm">
                <span>{formatDate(nextCreationDate, "dd/MM/yyyy")}</span>
              </div>
            </tr>
          )
        }}
      />
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
