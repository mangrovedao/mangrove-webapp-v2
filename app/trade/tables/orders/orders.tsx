"use client"

import { DataTable } from "../data-table"
import { useOrders } from "./use-orders"
import { useTable } from "./use-table"

export function Orders() {
  const ordersQuery = useOrders()
  const table = useTable({
    data: ordersQuery.data,
    onEdit: () => {
      console.log("edit")
    },
    onRetract: () => {
      console.log("delete")
    },
  })
  return <DataTable table={table} />
}
