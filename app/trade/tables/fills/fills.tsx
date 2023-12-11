"use client"

import { DataTable } from "../data-table"
import { useFills } from "./use-fills"
import { useTable } from "./use-table"

export function Fills() {
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
  return <DataTable table={table} />
}
