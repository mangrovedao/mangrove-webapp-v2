"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { usePoints } from "./hooks/use-points"
import { useTable } from "./hooks/use-table"

export function Points() {
  const { address: user, chainId, isConnected } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const {
    data: { data, totalRows },
    isLoading,
    error,
    refetch,
  } = usePoints({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  React.useEffect(() => {
    refetch?.()
  }, [chainId])

  const table = useTable({ pageSize, data })

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No points data yet."

  return (
    <DataTable
      table={table}
      emptyArrayMessage={emptyMessage}
      isError={!!error}
      isLoading={!data || isLoading}
      isRowHighlighted={(row) =>
        row.address.toLowerCase() === user?.toLowerCase()
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
        count: totalRows,
      }}
    />
  )
}
