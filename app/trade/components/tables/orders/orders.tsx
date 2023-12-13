"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import RetractOfferDialog from "./components/retract-offer-dialog"
import { useOrders } from "./hooks/use-orders"
import { useTable } from "./hooks/use-table"
import type { Order } from "./schema"

export function Orders() {
  const { market } = useMarket()
  const ordersQuery = useOrders()

  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<Order>()

  const table = useTable({
    data: ordersQuery.data,
    onEdit: () => {
      // TODO: implement edit with drawer
      console.log("edit")
    },
    onRetract: setOrderToDelete,
  })
  return (
    <>
      <DataTable
        table={table}
        isError={!!ordersQuery.error}
        isLoading={ordersQuery.isLoading || !market}
      />
      <RetractOfferDialog
        order={orderToDelete}
        market={market}
        onClose={() => setOrderToDelete(undefined)}
      />
    </>
  )
}
