"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { Ms2PointsRow } from "@/app/rewards/types"
import { Text } from "@/components/typography/text"
import { shortenAddress } from "@/utils/wallet"
import { Address } from "viem"
import { useAccount } from "wagmi"
import { Value, ValueLeft } from "../components/value"

const columnHelper = createColumnHelper<Ms2PointsRow>()
const DEFAULT_DATA: Ms2PointsRow[] = []

type Params = {
  data?: Ms2PointsRow[]
  pageSize: number
  user?: Address
}

const formatNumber = (num: number) => {
  if (num < 1 && num > 0) {
    return num.toFixed(4)
  }
  if (num < 1000) {
    return num.toFixed(0)
  }
  if (num < 1_000_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  if (num < 1_000_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num < 1_000_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  return `${(num / 1_000_000_000_000).toFixed(2)}T`
}

export function useMs2Table({ pageSize, data }: Params) {
  const { address: user } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Rank",
        cell: ({ row }) => {
          const rank = row.original.rank

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

          if (user?.toLowerCase() === address.toLowerCase()) {
            // Add a special style for the user's address
            return (
              <div className="flex gap-4">
                <ValueLeft value={shortenAddress(address)} />
                <Text
                  variant={"text1"}
                  className="flex justify-center font-light items-center p-2 h-7 rounded-sm bg-bg-primary"
                >
                  You're position
                </Text>
              </div>
            )
          }
          return <ValueLeft value={shortenAddress(address)} />
        },
      }),

      columnHelper.display({
        header: "Maker rewards",
        cell: ({ row }) => {
          const { makerReward } = row.original
          return <Value value={formatNumber(makerReward ?? 0)} />
        },
      }),

      columnHelper.display({
        header: "Taker rewards",
        cell: ({ row }) => {
          const { takerReward } = row.original
          return <Value value={formatNumber(takerReward ?? 0)} />
        },
      }),

      columnHelper.display({
        header: "Vault rewards",
        cell: ({ row }) => {
          const { vaultReward } = row.original
          return <Value value={formatNumber(vaultReward ?? 0)} />
        },
      }),

      columnHelper.display({
        header: "Total MGVs",
        cell: ({ row }) => {
          const { total } = row.original

          return <Value value={formatNumber(total ?? 0)} />
        },
      }),
    ],
    [user],
  )

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
