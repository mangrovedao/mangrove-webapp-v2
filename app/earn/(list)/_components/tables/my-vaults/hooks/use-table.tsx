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

import { Vault } from "@/app/earn/(shared)/types"
import { getChainImage } from "@/app/earn/(shared)/utils"
import { Button } from "@/components/ui/button"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  type: "user" | "all"
  data?: Vault[]
  pageSize: number
  onManage: (vault: Vault) => void
}

export function useTable({ type, pageSize, data, onManage }: Params) {
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
            <div className="flex flex-col underline ml-2">
              <Link
                className="hover:opacity-80 transition-opacity bg-[#284061] size-6 rounded-md flex items-center justify-center"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getChainImage(chain?.id, chain?.name)}
              </Link>
            </div>
          )
        },
      }),

      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { market } = row.original
          return (
            <Market base={market.base.address} quote={market.quote.address} />
          )
        },
      }),

      columnHelper.display({
        header: "Strategy",
        cell: ({ row }) => {
          const sourceInfo =
            row.original.type === "Aave"
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
          return <Value value="Redacted Labs" />
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
        header: "Deposited",
        cell: ({ row }) => {
          const { address } = row.original

          const value = "625.246,42"
          const symbol = "$"
          return <Value value={value} symbol={symbol} />
        },
      }),

      columnHelper.display({
        header: "My APY",
        cell: ({ row }) => {
          return <Value value="7.3%" />
        },
      }),

      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end space-x-1 items-center z-50">
              <Button className="text-text-tertiary" variant={"invisible"}>
                Manage
              </Button>
            </div>
          )
        },
      }),
    ],
    [onManage],
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
