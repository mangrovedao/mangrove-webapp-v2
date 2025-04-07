"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { useFeesRewards } from "@/app/rewards/hooks/use-fees-rewards"
import { useLeaderboardTable } from "./hooks/use-leaderboard-table"
export function LeaderboardTable() {
  const { address: user, chainId, isConnected } = useAccount()


  const { data, isLoading, error } = useFeesRewards()

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  const table = useLeaderboardTable({ pageSize: 0, data: data ?? [] })
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
          row.user.toLowerCase() === user?.toLowerCase()
        }
        rowHighlightedClasses={{
          row: "text-white hover:opacity-80 transition-all",
          inner: "!bg-[#1c3a40]",
        }}
        cellClasses="font-roboto"
        tableRowClasses="font-ubuntuLight"
      />
    </>
  )
}
