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
import { LeaderboardEpochEntry } from "../../schemas/epoch-history"
import Address from "./address"

const columnHelper = createColumnHelper<LeaderboardEpochEntry>()
const DEFAULT_DATA: LeaderboardEpochEntry[] = []

type Params = {
  data?: LeaderboardEpochEntry[]
}

export function useEpochTable({ data }: Params) {
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
      columnHelper.display({
        id: "boost",
        header: "Boost",
        cell: ({ row }) => {
          const { boost } = row.original
          return <div>{boost === 0 ? 1 : boost}x</div>
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
      columnHelper.accessor("community", {
        header: () => <div className="text-right">Community points</div>,
        cell: (row) => {
          const communityPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end font-roboto">
              {formatNumber(communityPoints)}
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
