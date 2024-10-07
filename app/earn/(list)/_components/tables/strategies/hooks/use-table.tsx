"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import React from "react"
import { useAccount } from "wagmi"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"

import { Button } from "@/components/ui/button"
import { chainsIcons } from "@/utils/chainsIcons"
import type { Strategy } from "../../../../_schemas/kandels"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  type: "user" | "all"
  data?: Strategy[]
  pageSize: number
  onCancel: (strategy: Strategy) => void
  onManage: (strategy: Strategy) => void
}

export function useTable({ type, pageSize, data, onCancel, onManage }: Params) {
  const { chain } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "blockchain-explorer",
        header: () => "",
        cell: ({ row }) => {
          const { address, owner } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url

          // note: check if we can retrive logos from library directly
          // const icon = getWhitelistedChainObjects().find(
          //   (item) => item.id === chain.id,
          // )

          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity bg-[#284061] p-2 rounded-md"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {chainsIcons[chain?.id || 1]}
              </Link>
            </div>
          )
        },
      }),

      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { base, quote } = row.original
          return <Market base={base} quote={quote} />
        },
      }),

      columnHelper.display({
        header: "Strategy",
        minSize: 300,

        cell: ({ row }) => {
          const sourceInfo =
            row.original.type === "KandelAAVE"
              ? { id: "Aave", name: "Aave" }
              : { id: "simple", name: "Wallet" }
          const isTrusted = true
          const value = `Kandel - ${sourceInfo.name}`

          return <Value value={value} trusted={isTrusted} />
        },
      }),

      columnHelper.display({
        header: "Manager",
        cell: ({ row }) => {
          const { base, quote } = row.original
          return <Value value="Redacted Labs" />
        },
      }),

      columnHelper.display({
        header: "TVL",
        cell: ({ row }) => {
          const { base, quote, offers } = row.original
          const value = "1.525.246,42"
          const symbol = "$"
          return <Value value={value} symbol={symbol} />
        },
      }),

      columnHelper.display({
        header: "Deposited",
        cell: ({ row }) => {
          const { base, quote, address, offers } = row.original
          const { data } = useStrategyStatus({
            address,
            base,
            quote,
            offers,
          })
          const value = "625.246,42"
          const symbol = "$"
          return <Value value={value} symbol={symbol} />
        },
      }),

      columnHelper.display({
        header: "My APY",
        cell: ({ row }) => {
          const { base, quote } = row.original
          return <Value value="7.3%" />
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: ({ row }) => {
          const hasLiveOffers = row.original.offers.some((x) => x.live)

          return (
            <div className="w-full h-full flex justify-end space-x-1 items-center">
              <Button className="text-text-tertiary" variant={"invisible"}>
                Manage
              </Button>
            </div>
          )
        },
      }),
    ],
    [onManage, onCancel],
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
