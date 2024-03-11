"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useTable } from "../tables/overview-open-orders/use-table"

export default function MyStrategies() {
  const table = useTable({
    data: [],
  })

  return (
    <ScrollArea className="h-full w-full" scrollHideDelay={200}>
      <div className="px-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span>My Strategies</span>
          <span className="bg-muted py-1 px-2 text-cloud-200 rounded-lg">
            5
          </span>
        </div>
        <DataTable
          table={table}
          // isError={!!ordersQuery.error}
          // isLoading={ordersQuery.isLoading || !market}
          // onRowClick={(order) =>
          //   setOrderToEdit({ order: order as Order, mode: "view" })
          // }
          // pagination={{
          //   onPageChange: setPageDetails,
          //   page,
          //   pageSize,
          //   count,
          // }}
        />
      </div>
      <ScrollBar orientation="horizontal" className="z-50" />
      <ScrollBar orientation="vertical" className="z-50" />
    </ScrollArea>
  )
}
