"use client"
import React from "react"

import { Title } from "@/components/typography/title"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useLeaderboard, useUserRank } from "./use-leaderboard"
import { useTable } from "./use-table"

export function Leaderboard() {
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const leaderboardQuery = useLeaderboard({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const useUserRankQuery = useUserRank()
  const user1 = {
    weightFromBlock: 1911920,
    account: "0x1cfc768eAd0103Fc4310A2612271595ef0D446dD",
    taker_points: "1537.7794927073496",
    maker_points: "0",
    total_points: "1537.7794927073496",
    referees_points: "0",
    rank: 106,
  }
  const data = React.useMemo(
    () => [...[user1], ...(leaderboardQuery.data ?? [])],
    [useUserRankQuery.dataUpdatedAt, leaderboardQuery.dataUpdatedAt],
  )

  console.log(useUserRankQuery)

  const table = useTable({
    // data: leaderboardQuery.data,
    data,
  })

  return (
    <div className="mt-16 !text-white">
      <Title variant={"title1"} className="mb-10">
        Leaderboard
      </Title>
      <DataTable
        table={table}
        isError={!!leaderboardQuery.error}
        isLoading={leaderboardQuery.isLoading}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count: 1,
        }}
        tableRowClasses="text-white"
      />
    </div>
  )
}
