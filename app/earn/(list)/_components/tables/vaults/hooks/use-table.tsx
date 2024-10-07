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

import { Vault } from "@/app/earn/(list)/_schemas/vaults"
import { Button } from "@/components/ui/button"
import { chainsIcons } from "@/utils/chainsIcons"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  type: "user" | "all"
  data?: Vault[]
  pageSize: number
  onDeposit: (vault: Vault) => void
  onManage: (vault: Vault) => void
}

export function useTable({ type, pageSize, data, onDeposit }: Params) {
  const { chain } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "blockchain-explorer",
        header: () => "",
        cell: ({ row }) => {
          const { address } = row.original
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
          const {
            market: {
              base: { address: base },
              quote: { address: quote },
            },
          } = row.original

          return <Market base={base} quote={quote} />
        },
      }),

      columnHelper.display({
        header: "Strategy",
        minSize: 300,

        cell: ({ row }) => {
          const isTrusted = true
          const value = `Kandel - ...`

          return <Value value={value} trusted={isTrusted} />
        },
      }),

      columnHelper.display({
        header: "Manager",
        cell: ({ row }) => {
          const {
            market: {
              base: { address: base },
              quote: { address: quote },
            },
          } = row.original
          return <Value value="Redacted Labs" />
        },
      }),

      columnHelper.display({
        header: "APY",
        cell: ({ row }) => {
          const value = "13.19%"
          return <Value value={value} />
        },
      }),

      columnHelper.display({
        header: "30 D",
        cell: ({ row }) => {
          const value = "7.13%"
          return <Value value={value} />
        },
      }),

      columnHelper.display({
        header: "TVL",
        cell: ({ row }) => {
          const value = "1.525.246,42"
          const symbol = "$"
          return <Value value={value} symbol={symbol} />
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end space-x-1 items-center">
              <Button className="text-text-tertiary" variant={"invisible"}>
                Deposit
              </Button>
            </div>
          )
        },
      }),
    ],
    [onDeposit],
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
