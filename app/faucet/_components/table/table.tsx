"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTokens } from "@/hooks/use-addresses"
import { Token } from "@mangrovedao/mgv"
import { useTable } from "./hooks/use-table"

export function FaucetTable() {
  const tokens = useTokens()
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
