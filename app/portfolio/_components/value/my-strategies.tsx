"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useTable } from "../tables/my-strategies/use-table"
import { useState } from "react"
import { useStrategies } from "@/app/strategies/(list)/_components/tables/strategies/hooks/use-strategies"

export default function MyStrategies() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { data, isLoading, error } = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const { data: strategiesCount } = useStrategies({
    select: (strategies) => strategies.length,
  })

  const table = useTable({
    data,
  })

  return (
    <ScrollArea className="h-full w-full" scrollHideDelay={200}>
      <div className="px-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span>My Strategies</span>
          {strategiesCount && (
            <span className="bg-muted py-1 px-2 text-cloud-200 rounded-lg">
              {strategiesCount}
            </span>
          )}
        </div>
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
      <ScrollBar orientation="horizontal" className="z-50" />
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
