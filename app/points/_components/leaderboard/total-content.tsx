import { DataTable } from "@/components/ui/data-table/data-table"
import React from "react"

import { Title } from "@/components/typography/title"
import { useEpochLeaderboard } from "./use-epoch-leaderboard"
import { useTable } from "./use-table"

const initialPageDetails = {
  page: 1,
  pageSize: 10,
}

export default function TotalContent({ account }: { account?: string }) {
  const [{ page, pageSize }, setPageDetails] =
    React.useState<PageDetails>(initialPageDetails)
  const totalLeaderboardQuery = useEpochLeaderboard({
    epoch: "total",
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
    },
  })
  const accountTotalQuery = useEpochLeaderboard({
    epoch: "total",
    account,
  })

  const data = React.useMemo(() => {
    if (totalLeaderboardQuery.isLoading) return []
    return totalLeaderboardQuery.data?.leaderboard ?? []
  }, [totalLeaderboardQuery.dataUpdatedAt])

  const accountData = React.useMemo(() => {
    if (accountTotalQuery.isLoading) return []
    return accountTotalQuery.data?.leaderboard ?? []
  }, [accountTotalQuery.dataUpdatedAt])

  const table = useTable({
    data: data,
  })

  const accountTable = useTable({
    data: accountData,
  })

  return (
    <>
      <Title variant={"title1"} className="mt-10 mb-5">
        Your points
      </Title>
      <DataTable
        skeletonRows={1}
        table={accountTable}
        isError={!!accountTotalQuery.error}
        isLoading={accountTotalQuery.isLoading}
        tableRowClasses="text-white"
        isRowHighlighted={(row) => row.account === account}
      />
      <Title variant={"title1"} className="mt-10 mb-5">
        Leaderboard
      </Title>
      <DataTable
        skeletonRows={10}
        table={table}
        isError={!!totalLeaderboardQuery.error}
        isLoading={totalLeaderboardQuery.isLoading}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count: Number(totalLeaderboardQuery.data?.totalCount ?? 0),
        }}
        tableRowClasses="text-white"
      />
    </>
  )
}
