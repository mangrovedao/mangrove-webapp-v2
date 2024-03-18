"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { IconButton } from "@/components/icon-button"
import { Close, Pen } from "@/svgs"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { shortenAddress } from "@/utils/wallet"
import { useAccount } from "wagmi"
import Link from "next/link"
import { Market } from "@/app/strategies/(list)/_components/tables/strategies/components/market"
import { Value } from "@/app/strategies/(list)/_components/tables/strategies/components/value"
import Status from "@/app/strategies/(shared)/_components/status"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  data?: Strategy[]
  onCancel: (strategy: Strategy) => void
  onManage: (strategy: Strategy) => void
}

export function useTable({ data, onCancel, onManage }: Params) {
  const { chain } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("address", {
        header: "Strategy address",
        cell: ({ row }) => {
          const { address } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url
          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenAddress(address)}
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
        header: "Balance",
      }),
      columnHelper.display({
        header: "Value",
        cell: ({ row }) => {
          const { base, quote, depositedBase, depositedQuote } = row.original
          return (
            <Value
              base={base}
              baseValue={depositedBase}
              quote={quote}
              quoteValue={depositedQuote}
            />
          )
        },
      }),
      columnHelper.display({
        header: "Status",
        cell: ({ row }) => {
          const { base, quote, address, offers } = row.original
          return (
            <Status
              base={base}
              quote={quote}
              address={address}
              offers={offers}
            />
          )
        },
      }),
      columnHelper.display({
        header: "Return (%)",
        cell: ({ row }) => {
          const { return: ret } = row.original
          return (
            <div className="flex flex-col">
              <div>{isNaN(ret as number) ? "-" : ret?.toString()}</div>
            </div>
          )
        },
      }),
      columnHelper.display({
        header: "Liquidity source",
        cell: () => "Wallet",
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="w-full h-full flex justify-end space-x-1">
            <IconButton
              tooltip="Manage"
              className="aspect-square w-6 rounded-full"
              onClick={() => onManage(row.original)}
            >
              <Pen />
            </IconButton>
            <IconButton
              tooltip="Cancel strategy"
              className="aspect-square w-6 rounded-full"
              onClick={() => onCancel(row.original)}
            >
              <Close />
            </IconButton>
          </div>
        ),
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
