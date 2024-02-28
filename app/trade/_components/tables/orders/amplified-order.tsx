"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import CancelOfferDialog from "./components/cancel-offer-dialog"
import EditOrderSheet from "./components/edit-order-sheet"
import { useAmplifiedOrders } from "./hooks/use-amplified-orders"
import { useOrders } from "./hooks/use-orders"
import { useTable } from "./hooks/use-table"
import type { AmplifiedOrder } from "./schema"

export function AmplifiedOrders() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const { data: count } = useOrders({
    select: (orders) => orders.length,
  })

  const amplifiedOrdersQuery = useAmplifiedOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })
  console.log(amplifiedOrdersQuery.data)
  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<AmplifiedOrder>()
  const [orderToEdit, setOrderToEdit] = React.useState<{
    order: AmplifiedOrder
    mode: "view" | "edit"
  }>()

  const table = useTable({
    data: amplifiedOrdersQuery.data,
    onEdit: (order) => setOrderToEdit({ order, mode: "edit" }),
    onCancel: setOrderToDelete,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!amplifiedOrdersQuery.error}
        isLoading={amplifiedOrdersQuery.isLoading || !market}
        onRowClick={(order) =>
          setOrderToEdit({ order: order as AmplifiedOrder, mode: "view" })
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
        market={market}
        onClose={() => setOrderToEdit(undefined)}
      />
      <CancelOfferDialog
        order={orderToDelete}
        market={market}
        onClose={() => setOrderToDelete(undefined)}
      />
    </>
  )
}
