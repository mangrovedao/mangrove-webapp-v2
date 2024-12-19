"use client"
import React from "react"

import useMarket from "@/providers/market"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useOrderHistory } from "./use-order-history"
import { useTable } from "./use-table"

export function OrderHistory() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket: market } = useMarket()
  const { data: count } = useOrderHistory({
    select: (orderHistory) => orderHistory.length,
  })
  const orderHistoryQuery = useOrderHistory({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data: orderHistoryQuery.data,
  })

  return (
    <DataTable
      table={table}
      isError={!!orderHistoryQuery.error}
      isLoading={orderHistoryQuery.isLoading || !market}
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count,
      }}
    />
  )
}
