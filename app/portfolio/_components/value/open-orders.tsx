"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../tables/open-orders/use-table"

export default function OpenOrders() {
  const table = useTable({
    data: [],
  })

  return (
    <div className="px-6 space-y-2">
      <div className="flex items-center space-x-2">
        <span>Open orders</span>
        <span className="bg-muted py-1 px-2 text-cloud-200 rounded-lg">3</span>
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
  )
}
