"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { useAccount } from "wagmi"

import { PointsRow } from "@/app/rewards/types"
import { Button } from "@/components/ui/button"
import { isAddressEqual } from "viem"
import { Value, ValueLeft } from "../components/value"

const columnHelper = createColumnHelper<PointsRow>()
const DEFAULT_DATA: PointsRow[] = []

type Params = {
  data?: PointsRow[]
  pageSize: number
}

export function useTable({ pageSize, data }: Params) {
  const { chain, address: user } = useAccount()

  const columns = React.useMemo(() => [
    columnHelper.display({
      header: "Rank",
      cell: ({ row }) => {
        const { rank } = row.original
        switch (rank) {
          case 1:
            return (
              <div className="bg-[#BD8800] border-2 border-[#E5C675] mx-auto w-6 h-6 rounded-full text-center flex">
                <p className="my-auto mx-auto">1</p>
              </div>
            )
          case 2:
            return (
              <div className="bg-[#626A6A] border-2 flex border-[#959D9D] mx-auto w-6 h-6 rounded-full text-center">
                <p className="my-auto mx-auto">2</p>
              </div>
            )

          case 3:
            return (
              <div className="bg-[#804915] border-2 flex border-[#E09A59] mx-auto w-6 h-6 rounded-full text-center">
                <p className="my-auto mx-auto">3</p>
              </div>
            )
          default:
            return <Value value={rank?.toString() ?? "???"} />
        }
      },
    }),

    columnHelper.display({
      header: "Address",
      cell: ({ row }) => {
        const { address } = row.original
        const addr = address.slice(0, 6) + "..." + address.slice(-4)
        if (isAddressEqual(address, user!)) {
          // Add a special style for the user's address
          return (
            <>
              <ValueLeft value={addr} />
              <Button
                variant={"primary"}
                size={"xs"}
                className="w-full ml-2 px-2"
              >
                You
              </Button>
            </>
          )
        }
        return <ValueLeft value={addr} />
      },
    }),

    columnHelper.display({
      header: "LP points",
      cell: ({ row }) => {
        const { lpPoints } = row.original
        const lp = (lpPoints ?? 0).toString()
        return <Value value={lp} />
      },
    }),

    columnHelper.display({
      header: "Trading points",
      cell: ({ row }) => {
        const { tradingPoints } = row.original
        return <Value value={(tradingPoints ?? 0).toString()} />
      },
    }),

    columnHelper.display({
      header: "Referral points",
      cell: ({ row }) => {
        const { referralPoints } = row.original
        return <Value value={(referralPoints ?? 0).toString()} />
      },
    }),

    columnHelper.display({
      header: "Community points",
      cell: ({ row }) => {
        const { communityPoints } = row.original
        return <Value value={(communityPoints ?? 0).toString()} />
      },
    }),

    columnHelper.display({
      header: "Total points",
      cell: ({ row }) => {
        const { totalPoints } = row.original
        return <Value value={(totalPoints ?? 0).toString()} />
      },
    }),
  ])

  return useReactTable({
    data: data ?? DEFAULT_DATA,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
