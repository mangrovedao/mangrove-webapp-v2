"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/strategies/use-table"

export default function Page() {
  const table = useTable({
    data: [],
  })

  return (
    <main className="w-full">
      <h1 className="p-4">My Strategies</h1>

      <div className="px-3">
        <DataTable table={table} />
      </div>
    </main>
  )
}
