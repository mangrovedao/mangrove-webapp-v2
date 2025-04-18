"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { Token } from "@mangrovedao/mgv"
import { useTable } from "./hooks/use-table"

export function FaucetTable() {
  const { tokens } = useOpenMarkets()
  const table = useTable({
    data: (tokens as unknown as Token[]) ?? [],
  })

  return (
    <DataTable
      table={table}
      // isError={!!tokensQuery.error}
      // isLoading={tokensQuery.isLoading}
    />
  )
}
