"use client"
import React from "react"

import useMarket from "@/providers/market"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { AnimatedFillsSkeleton } from "./animated-fills-skeleton"
import { useFills } from "./use-fills"
import { useTable } from "./use-table"

export function Fills() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket: market } = useMarket()
  const { data: count } = useFills({
    select: (fills) => fills.length,
  })
  const fillsQuery = useFills({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data: fillsQuery.data,
  })

  if (fillsQuery.isLoading || !market) {
    return <AnimatedFillsSkeleton />
  }

  return (
    <DataTable
      emptyArrayMessage="No trade history"
      table={table}
      isError={false}
      isLoading={false}
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count,
      }}
      animated={true}
      animationVariant="slide"
    />
  )
}
