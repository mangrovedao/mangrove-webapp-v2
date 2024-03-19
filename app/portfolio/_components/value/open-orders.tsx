"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../tables/overview-open-orders/use-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useOrders } from "@/app/trade/_components/tables/orders/hooks/use-orders"

export default function OpenOrders() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const ordersQuery = useOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data: ordersQuery.data,
  })

  return (
    <ScrollArea className="h-full w-full" scrollHideDelay={200}>
      <div className="px-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span>Open orders</span>
          <span className="bg-muted py-1 px-2 text-cloud-200 rounded-lg">
            3
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
