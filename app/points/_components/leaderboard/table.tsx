"use client"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import InfoTooltip from "@/components/info-tooltip"
import { Title } from "@/components/typography/title"
import { DataTable } from "@/components/ui/data-table/data-table"
import { cn } from "@/utils"
import { useLeaderboard, useUserPoints, type Epoch } from "./use-leaderboard"
import { useTable } from "./use-table"

const initialPageDetails = {
  page: 1,
  pageSize: 10,
}

export function Leaderboard() {
  const [epoch, setEpoch] = React.useState<Epoch>("total")
  const [{ page, pageSize }, setPageDetails] =
    React.useState<PageDetails>(initialPageDetails)
  const leaderboardQuery = useLeaderboard({
    epoch,
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
    },
  })

  React.useEffect(() => {
    setPageDetails(initialPageDetails)
  }, [epoch])

  const userPointsQuery = useUserPoints()
  // const {  } = useEpochLeaderboard()
  const currentUser = userPointsQuery.data
  const data = React.useMemo(() => {
    if (leaderboardQuery.isLoading) return []
    return leaderboardQuery.data?.leaderboard ?? []
  }, [leaderboardQuery.dataUpdatedAt])

  const userData = React.useMemo(() => {
    if (userPointsQuery.isLoading) return []
    return [userPointsQuery.data] ?? []
  }, [userPointsQuery.dataUpdatedAt])

  const userTable = useTable({
    //@ts-ignore
    data: userData,
  })

  const table = useTable({
    //@ts-ignore
    data: data,
  })

  return (
    <div className="mt-16 !text-white">
      <CustomTabs
        defaultValue={"total"}
        className={cn("h-full mb-10")}
        onValueChange={(e) => setEpoch(e as Epoch)}
      >
        <CustomTabsList className="w-full flex justify-start border-b">
          <CustomTabsTrigger value={"current"} className="capitalize">
            Current Epoch (#1){" "}
            <InfoTooltip className="ml-0">April 2 to April 9</InfoTooltip>
          </CustomTabsTrigger>
          <CustomTabsTrigger value={"total"} className="capitalize">
            Total
            <InfoTooltip className="ml-0">February 28 to today</InfoTooltip>
          </CustomTabsTrigger>
        </CustomTabsList>
        <Title variant={"title1"} className="mb-5 mt-10">
          Your points
        </Title>
        <CustomTabsContent value="current"></CustomTabsContent>
        <CustomTabsContent value="total">
          <DataTable
            skeletonRows={1}
            table={userTable}
            isError={!!userPointsQuery.error}
            isLoading={userPointsQuery.isLoading}
            tableRowClasses="text-white"
            isRowHighlighted={(row) => row.account === currentUser?.account}
          />
          <Title variant={"title1"} className="mt-10 mb-5">
            Leaderboard
          </Title>
          <DataTable
            skeletonRows={10}
            table={table}
            isError={!!leaderboardQuery.error}
            isLoading={leaderboardQuery.isLoading}
            pagination={{
              onPageChange: setPageDetails,
              page,
              pageSize,
              count: leaderboardQuery.data?.leaderboard_length ?? 0,
            }}
            tableRowClasses="text-white"
          />
        </CustomTabsContent>
      </CustomTabs>
    </div>
  )
}
