"use client"

import useMarket from "@/providers/market"
import { DataTable } from "../../../../components/ui/data-table/data-table"
import { useOrders } from "./use-orders"
import { useTable } from "./use-table"

export function Orders() {
  const { market } = useMarket()
  const ordersQuery = useOrders()
  const table = useTable({
    data: ordersQuery.data,
    onEdit: () => {
      console.log("edit")
    },
    onRetract: async (offer) => {
      console.log("delete", offer)
      // await market?.retractRestingOrder("")
    },
  })
  return (
    <DataTable
      table={table}
      isError={!!ordersQuery.error}
      isLoading={ordersQuery.isLoading || !market}
    />
  )
}
