"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { usePoints } from "./hooks/use-points"
import { useTable } from "./hooks/use-table"

export function Points() {
  const { push } = useRouter()
  const { address: user } = useAccount()

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
  })

  const { data: count } = usePoints({
    select: (points) => points.totalRows,
  })

  const table = useTable({ pageSize, data: points.data })

  return (
    <DataTable
      table={table}
      emptyArrayMessage="No points data yet."
      isError={!!error}
      isLoading={!points}
      isRowHighlighted={(row) =>
        row.address.toLowerCase() === user.toLowerCase()
      }
      rowHighlightedClasses={{
        row: "text-white hover:opacity-80 transition-all",
        inner: "!bg-[#1c3a40]",
      }}
      cellClasses="font-roboto"
      tableRowClasses="font-ubuntuLight"
      pagination={{
        onPageChange: setPageDetails,
        page,
        pageSize,
        count: points?.totalRows,
      }}
    />
  )
}
