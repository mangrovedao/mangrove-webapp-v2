"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import { useStrategies } from "./hooks/use-strategies"
import { useTable } from "./hooks/use-table"
import { MOCKS } from "./mock"
import type { Strategy } from "./schema"

export function Strategies() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const ordersQuery = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected strategy to cancel
  const [strategyToCancel, setStrategyToCancel] = React.useState<Strategy>()

  const table = useTable({
    data: MOCKS,
    onManage: () => {
      // TODO: implement
      console.log("manage")
    },
    onCancel: setStrategyToCancel,
  })
  return (
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
  )
}
