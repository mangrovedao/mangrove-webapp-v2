"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market.new"
import CancelOfferDialog from "./components/cancel-offer-dialog"
import EditOrderSheet from "./components/edit-order-sheet"
import { useOrders } from "./hooks/use-orders"
import { useTable } from "./hooks/use-table"
import type { Order } from "./schema"

export function Orders() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket, setMarket, markets } = useMarket()
  const { data: count } = useOrders({
    select: (orders) => orders.length,
  })
  const ordersQuery = useOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<Order>()
  const [orderToEdit, setOrderToEdit] = React.useState<{
    order: Order
    mode: "view" | "edit"
  }>()

  const table = useTable({
    data: ordersQuery.data,
    onEdit: (order) => setOrderToEdit({ order, mode: "edit" }),
    onCancel: setOrderToDelete,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!ordersQuery.error}
        isLoading={ordersQuery.isLoading}
        onRowClick={(order) =>
          setOrderToEdit({ order: order as Order, mode: "view" })
        }
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count,
        }}
      />
      <EditOrderSheet
        orderInfos={orderToEdit}
        market={{ currentMarket, setMarket, markets }}
        onClose={() => setOrderToEdit(undefined)}
      />
      <CancelOfferDialog
        order={orderToDelete}
        market={{ currentMarket, setMarket, markets }}
        onClose={() => setOrderToDelete(undefined)}
      />
    </>
  )
}
