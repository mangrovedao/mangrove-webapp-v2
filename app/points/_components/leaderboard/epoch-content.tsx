import { DataTable } from "@/components/ui/data-table/data-table"
import React from "react"

import { Title } from "@/components/typography/title"
import { useEpochLeaderboard } from "./use-epoch-leaderboard"
import { useEpochTable } from "./use-epoch-table"

const initialPageDetails = {
  page: 1,
  pageSize: 10,
}

export default function EpochContent({
  name,
  account,
}: {
  name: string
  account?: string
}) {
  const epochNumber = name.split(" ")[1] as any
  const epoch =
    epochNumber === undefined
      ? "total"
      : (`epoch-${epochNumber}` as `epoch-${number}` | "total")
  const [{ page, pageSize }, setPageDetails] =
    React.useState<PageDetails>(initialPageDetails)
  const epochLeaderboardQuery = useEpochLeaderboard({
    epoch,
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
    },
  })
  const accountEpochQuery = useEpochLeaderboard({
    epoch,
    account,
  })

  const data = React.useMemo(() => {
    if (epochLeaderboardQuery.isLoading) return []
    return epochLeaderboardQuery.data?.leaderboard ?? []
  }, [epochLeaderboardQuery.dataUpdatedAt])

  const accountData = React.useMemo(() => {
    if (accountEpochQuery.isLoading) return []
    return accountEpochQuery.data?.leaderboard ?? []
  }, [accountEpochQuery.dataUpdatedAt])

  const table = useEpochTable({
    // @ts-ignore
    data: data,
  })

  const accountTable = useEpochTable({
    // @ts-ignore
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
        isError={!!accountEpochQuery.error}
        isLoading={accountEpochQuery.isLoading}
        tableRowClasses="text-white"
        isRowHighlighted={(row) => row.account === account}
      />
      <Title variant={"title1"} className="mt-10 mb-5">
        Leaderboard
      </Title>
      <DataTable
        skeletonRows={10}
        table={table}
        isError={!!epochLeaderboardQuery.error}
        isLoading={epochLeaderboardQuery.isLoading}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count: Number(epochLeaderboardQuery.data?.totalCount ?? 0),
        }}
        tableRowClasses="text-white"
      />
    </>
  )
}
