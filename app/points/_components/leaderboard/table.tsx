"use client"
import React from "react"

import { Title } from "@/components/typography/title"
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
  // console.log("useUserRankQuery", useUserRankQuery)
  const data = [
    ...(useUserRankQuery?.data ?? []),
    ...(leaderboardQuery.data ?? []),
  ]

  console.log("data", leaderboardQuery.data, useUserRankQuery)

  const table = useTable({
    data,
  })

  return (
    <div className="mt-16 !text-white">
      <Title variant={"title1"} className="mb-10">
        Leaderboard
      </Title>
      {/* <DataTable
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
      /> */}
    </div>
  )
}
