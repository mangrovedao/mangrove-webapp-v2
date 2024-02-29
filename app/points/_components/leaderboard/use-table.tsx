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
import { shortenAddress } from "@/utils/wallet"
import type { Leaderboard } from "./schema"

const columnHelper = createColumnHelper<Leaderboard>()
const DEFAULT_DATA: Leaderboard[] = []

type Params = {
  data?: Leaderboard[]
}

export function useTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "Rank",
        cell: (row) => {
          const rank = row.getValue()
          return (
            <div className="flex items-center space-x-2">
              {rank}{" "}
              {rank === 1 ? (
                <Rank1Icon className="size-7 ml-2" />
              ) : rank === 2 ? (
                <Rank2Icon className="size-7 ml-2" />
              ) : rank === 3 ? (
                <Rank3Icon className="size-7 ml-2" />
              ) : null}
            </div>
          )
        },
      }),
      columnHelper.accessor("account", {
        header: "Trader",
        cell: (row) => {
          const address = row.getValue()
          const shortenedAddress = shortenAddress(address)
          return <div>{shortenedAddress}</div>
        },
      }),
      columnHelper.display({
        header: "Boost",
        cell: () => <div className={"text-green-caribbean"}>15%</div>,
      }),
      columnHelper.accessor("maker_points", {
        header: () => <div className="text-right">LP points</div>,
        cell: (row) => {
          const makerPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end">{makerPoints}</div>
          )
        },
      }),
      columnHelper.accessor("taker_points", {
        header: () => <div className="text-right">Trading points</div>,
        cell: (row) => {
          const tradingPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end">
              {tradingPoints}
            </div>
          )
        },
      }),

      columnHelper.accessor("total_points", {
        header: () => <div className="text-right">Total points</div>,
        cell: (row) => {
          const totalPoints = row.getValue()
          return (
            <div className="w-full h-full flex justify-end">{totalPoints}</div>
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
