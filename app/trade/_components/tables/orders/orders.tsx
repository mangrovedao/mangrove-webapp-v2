"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import { EditOrderDrawer } from "./components/edit-order-drawer"
import RetractOfferDialog from "./components/retract-offer-dialog"
import { useOrders } from "./hooks/use-orders"
import { useTable } from "./hooks/use-table"
import type { Order } from "./schema"

export function Orders() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const ordersQuery = useOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<Order>()
  const [orderToEdit, setOrderToEdit] = React.useState<Order>()

  const table = useTable({
    data: ordersQuery.data,
    onEdit: setOrderToEdit,
    onRetract: setOrderToDelete,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!ordersQuery.error}
        isLoading={ordersQuery.isLoading || !market}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
        }}
      />
      <EditOrderDrawer
        order={orderToEdit}
        market={market}
        onClose={() => setOrderToEdit(undefined)}
      />
      <RetractOfferDialog
        order={orderToDelete}
        market={market}
        onClose={() => setOrderToDelete(undefined)}
      />
    </>
  )
}
