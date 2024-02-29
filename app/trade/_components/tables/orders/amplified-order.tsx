"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import CancelAmplifiedOfferDialog from "./components/cancel-amplified-offer-dialog"
import EditAmplifiedOrderSheet from "./components/edit-amplified-order-sheet"
import { useAmplifiedOrders } from "./hooks/use-amplified-orders"
import { useAmplifiedTable } from "./hooks/use-amplified-table"
import { useOrders } from "./hooks/use-orders"
import type { AmplifiedOrder } from "./schema"

export function AmplifiedOrders() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const { marketsInfoQuery, mangrove } = useMangrove()
  const { data: openMarkets } = marketsInfoQuery
  const { data: count } = useOrders({
    select: (orders) => orders.length,
  })

  const amplifiedOrdersQuery = useAmplifiedOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<AmplifiedOrder>()
  const [orderToEdit, setOrderToEdit] = React.useState<{
    order: AmplifiedOrder
    mode: "view" | "edit"
  }>()

  const table = useAmplifiedTable({
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
      <EditAmplifiedOrderSheet
        orderInfos={orderToEdit}
        openMarkets={openMarkets}
        onClose={() => setOrderToEdit(undefined)}
      />
      <CancelAmplifiedOfferDialog
        order={orderToDelete}
        market={market}
        onClose={() => setOrderToDelete(undefined)}
      />
    </>
  )
}
