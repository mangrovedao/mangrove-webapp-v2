"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { useFeesRewards } from "@/app/rewards/hooks/use-fees-rewards"
import { useLeaderboardTable } from "./hooks/use-leaderboard-table"
import { useIncentivesRewards } from "@/app/rewards/hooks/use-incentives-rewards"
export function LeaderboardTable() {
  const { address: user, chainId, isConnected } = useAccount()


  const { data: feesData, isLoading: isFeesLoading, error: feesError } = useFeesRewards()
  //const { data: incentivesData, isLoading: isIncentivesLoading, error: incentivesError } = useIncentivesRewards()

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  const table = useLeaderboardTable({ pageSize: 0, data: feesData ?? [] })
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
        isError={!!feesError}
        isLoading={isFeesLoading}
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
