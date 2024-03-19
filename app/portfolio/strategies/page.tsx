"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/strategies/use-table"
import { useState } from "react"
import { useStrategies } from "@/app/strategies/(list)/_components/tables/strategies/hooks/use-strategies"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useRouter } from "next/navigation"

export default function Page() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { data, error, isLoading } = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })
  const { push } = useRouter()

  const table = useTable({
    data,
    onManage: (strategy: Strategy) => {
      push(`/strategies/${strategy.address}`)
    },
    onCancel: () => {}, // TODO: implement cancel
  })

  return (
    <main className="w-full">
      <h1 className="p-4">My Strategies</h1>

      <div className="px-3">
        <DataTable
          table={table}
          isError={!!error}
          isLoading={isLoading}
          pagination={{
            onPageChange: setPageDetails,
            page,
            pageSize,
            count: data?.length ?? 0,
          }}
        />
      </div>
    </main>
  )
}
