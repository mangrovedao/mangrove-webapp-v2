"use client"
import React from "react"

import useMarket from "@/providers/market"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useFills } from "./use-fills"
import { useTable } from "./use-table"

export function Fills() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const { data: count } = useFills({
    select: (fills) => fills.length,
  })
  const fillsQuery = useFills({
    filters: {
      first: pageSize,
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data: fillsQuery.data,
  })

  return (
    <DataTable
      table={table}
      isError={!!fillsQuery.error}
      isLoading={fillsQuery.isLoading || !market}
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count,
      }}
    />
  )
}
