"use client"
import React from "react"

import useMarket from "@/providers/market.new"
import { useOrders } from "./hooks/use-orders"
import type { AmplifiedOrder } from "./schema"

export function AmplifiedOrders() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket, setMarket, markets } = useMarket()
  const { data: count } = useOrders({
    select: (orders) => orders.length,
  })

  // const amplifiedOrdersQuery = useAmplifiedOrders({
  //   filters: {
  //     skip: (page - 1) * pageSize,
  //   },
  // })

  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<AmplifiedOrder>()
  const [orderToEdit, setOrderToEdit] = React.useState<{
    order: AmplifiedOrder
    mode: "view" | "edit"
  }>()

  // const table = useAmplifiedTable({
  //   data: amplifiedOrdersQuery.data,
  //   onEdit: (order) => setOrderToEdit({ order, mode: "edit" }),
  //   onCancel: setOrderToDelete,
  // })

  return (
    <>
      {/* <DataTable
        table={table}
        isError={!!amplifiedOrdersQuery.error}
        isLoading={amplifiedOrdersQuery.isLoading || !currentMarket}
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
        openMarkets={markets}
        onClose={() => setOrderToEdit(undefined)}
      />
      <CancelAmplifiedOfferDialog
        order={orderToDelete}
        market={{ currentMarket, setMarket, markets }}
        onClose={() => setOrderToDelete(undefined)}
      /> */}
    </>
  )
}
