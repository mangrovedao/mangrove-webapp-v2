"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { usePoints } from "./hooks/use-points"
import { useTable } from "./hooks/use-table"

export function Points() {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const {
    data: points,
    isLoading,
    error,
    refetch,
  } = usePoints({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [chainId])

  const { data: count } = usePoints({
    select: (points) => points.length,
  })

  const table = useTable({ pageSize, data: points })

  return (
    <DataTable
      table={table}
      emptyArrayMessage="No points data yet."
      isError={!!error}
      isLoading={!points}
      cellClasses="font-roboto"
      tableRowClasses="font-ubuntuLight"
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count: points?.length,
      }}
    />
  )
}
