"use client"

import useMarket from "@/providers/market"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useFills } from "./use-fills"
import { useTable } from "./use-table"

export function Fills() {
  const { market } = useMarket()
  const fillsQuery = useFills()

  const table = useTable({
    data: fillsQuery.data,
    onEdit: () => {
      console.log("edit")
    },
    onRetract: () => {
      console.log("delete")
    },
  })
  return (
    <DataTable
      table={table}
      isError={!!fillsQuery.error}
      isLoading={fillsQuery.isLoading || !market}
    />
  )
}
