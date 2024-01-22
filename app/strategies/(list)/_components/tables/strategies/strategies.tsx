"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import type { Strategy } from "../../../_schemas/kandels"
import { useStrategies } from "./hooks/use-strategies"
import { useTable } from "./hooks/use-table"
import { MOCKS } from "./mock"

export function Strategies() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const { data: count } = useStrategies({
    select: (strategies) => strategies.length,
  })
  const strategiesQuery = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected strategy to cancel
  const [, setStrategyToCancel] = React.useState<Strategy>()

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
      isError={!!strategiesQuery.error}
      isLoading={strategiesQuery.isLoading || !market}
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count,
      }}
    />
  )
}
