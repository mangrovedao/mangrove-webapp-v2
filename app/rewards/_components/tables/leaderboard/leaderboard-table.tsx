"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { useLeaderboard } from "./hooks/use-leaderboard"
import { useLeaderboardTable } from "./hooks/use-leaderboard-table"

// Define the PageDetails type at the top of the file
interface PageDetails {
  page: number
  pageSize: number
}

export function LeaderboardTable() {
  const { address: user, chainId, isConnected } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const { data, isLoading, error, refetch } = useLeaderboard({
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
    },
  })

  const { data: count } = useLeaderboard({
    select: (points) => points.length,
  })

  React.useEffect(() => {
    refetch?.()
  }, [chainId, page, user, refetch])

  const table = useLeaderboardTable({ pageSize, data, user })

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  return (
    <>
      {/* <aside>
        <div className="flex align-middle items-center space-x-2 p-2">
          <div>
            <Caption className="text-base!">
              Description of ms2 rewards...
            </Caption>
          </div>
        </div>
      </aside> */}
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
          count: typeof count === "number" ? count : data?.length ?? 0,
        }}
      />
    </>
  )
}
