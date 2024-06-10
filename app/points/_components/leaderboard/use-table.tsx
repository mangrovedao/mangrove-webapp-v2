"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { Rank1Icon, Rank2Icon, Rank3Icon } from "@/svgs"
import { formatNumber } from "@/utils/numbers"
import { LeaderboardEntry } from "../../schemas/leaderboard"
import Address from "./address"

const columnHelper = createColumnHelper<LeaderboardEntry>()
const DEFAULT_DATA: LeaderboardEntry[] = []

type Params = {
  data?: LeaderboardEntry[]
}

export function useTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "Rank",
        cell: (row) => {
          const rank = row?.getValue()
          return (
            <div className="flex items-center space-x-2 font-roboto">
              {rank > 0 ? rank : undefined}{" "}
              {rank === 1 ? (
                <Rank1Icon className="size-7 ml-2" />
              ) : rank === 2 ? (
                <Rank2Icon className="size-7 ml-2" />
              ) : rank === 3 ? (
                <Rank3Icon className="size-7 ml-2" />
              ) : rank === -1 ? (
                "Unranked"
              ) : null}
            </div>
          )
        },
      }),
      columnHelper.accessor("account", {
        header: "Trader",
        cell: (row) => {
          const address = row.getValue()
          return <Address address={address} />
        },
      }),
      columnHelper.accessor("maker", {
        header: () => <div className="text-right">LP points</div>,
        cell: (row) => {
          const makerPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end font-roboto">
              {formatNumber(makerPoints)}
            </div>
          )
        },
      }),
      columnHelper.accessor("taker", {
        header: () => <div className="text-right">Trading points</div>,
        cell: (row) => {
          const tradingPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end font-roboto">
              {formatNumber(tradingPoints)}
            </div>
          )
        },
      }),
      columnHelper.accessor("ref", {
        header: () => <div className="text-right">Referral points</div>,
        cell: (row) => {
          const refereesPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end font-roboto">
              {formatNumber(refereesPoints)}
            </div>
          )
        },
      }),
      columnHelper.accessor("total", {
        header: () => <div className="text-right">Total points</div>,
        cell: (row) => {
          const totalPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end font-roboto">
              {formatNumber(totalPoints)}
            </div>
          )
        },
      }),
    ],
    [],
  )

  return useReactTable({
    data: data ?? DEFAULT_DATA,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
