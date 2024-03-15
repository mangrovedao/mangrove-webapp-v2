"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/strategies/use-table"
import { useState } from "react"
import { useStrategies } from "@/app/strategies/(list)/_components/tables/strategies/hooks/use-strategies"

export default function Page() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { data } = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data,
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
