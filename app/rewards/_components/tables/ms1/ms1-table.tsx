"use client"
import React from "react"

import { Caption } from "@/components/typography/caption"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { useMs1Points } from "./hooks/use-ms1-points"
import { useMs1Table } from "./hooks/use-ms1-table"
export function Ms1Table() {
  const { address: user, chainId, isConnected } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const { data, isLoading, error, refetch } = useMs1Points({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const { data: count } = useMs1Points({
    select: (points) => points.length ?? 0,
  })

  React.useEffect(() => {
    refetch?.()
  }, [chainId, page, user])

  const table = useMs1Table({ pageSize, data, user })

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  return (
    <>
      <aside>
        <div className="flex align-middle items-center space-x-2 p-2">
          <div>
            <Caption className="text-base!">
              Points allocated to early users and community members from ... to
              July 2024. These points will be soon converted into MGVs.
            </Caption>
          </div>
        </div>
      </aside>

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
          count,
        }}
      />
    </>
  )
}
