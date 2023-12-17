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
import { useNetwork } from "wagmi"

import { IconButton } from "@/components/icon-button"
import { Close, Pen } from "@/svgs"
import { shortenAddress } from "@/utils/wallet"
import Big from "big.js"
import { Market } from "../components/market"
import { Value } from "../components/value"
import type { Strategy } from "../schema"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  data?: Strategy[]
  onCancel: (strategy: Strategy) => void
  onManage: (strategy: Strategy) => void
}

export function useTable({ data, onCancel, onManage }: Params) {
  const { chain } = useNetwork()
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "addresses",
        header: () => (
          <div className="text-left">
            <div>Strategy address</div>
            <div>Wallet address</div>
          </div>
        ),
        cell: ({ row }) => {
          const { address, transactionHash } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url
          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity"
                href={`${blockExplorerUrl}/tx/${address}`}
              >
                {shortenAddress(address)}
              </Link>
              <Link
                className="hover:opacity-80 transition-opacity"
                href={`${blockExplorerUrl}/address/${transactionHash}`}
              >
                {shortenAddress(transactionHash)}
              </Link>
            </div>
          )
        },
      }),
      // TODO: get min max from indexer
      columnHelper.display({
        id: "min-max",
        header: () => (
          <div>
            <div>Min</div>
            <div>Max</div>
          </div>
        ),
        cell: ({ row }) => {
          const { depositedBase, depositedQuote } = row.original
          return (
            <div className="flex flex-col">
              <div>{Big(depositedBase).toFixed(2)}</div>
              <div>{Big(depositedQuote).toFixed(2)}</div>
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
      // TODO: get from indexer
      columnHelper.display({
        header: "Value",
        cell: ({ row }) => {
          const { quote } = row.original
          return <Value quote={quote} value={"123.484"} />
        },
      }),
      // TODO: get from indexer
      columnHelper.accessor((_) => _, {
        header: "Return (%)",
        cell: () => "5%",
      }),
      // TODO: get from indexer
      columnHelper.accessor((_) => _, {
        header: "Liquidity source",
        cell: () => "Wallet",
      }),
      // TODO: get from indexer
      columnHelper.accessor((_) => _, {
        header: "Reward",
        cell: () => "3.39%",
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="w-full h-full flex justify-end space-x-1">
            <IconButton
              tooltip="Manage"
              className="aspect-square w-6 rounded-full"
              disabled
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
    [onManage, onCancel],
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
