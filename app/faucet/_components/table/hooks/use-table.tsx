"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { useNetwork } from "wagmi"

import { TokenIcon } from "@/components/token-icon"
import Link from "next/link"
import { Actions } from "../components/actions"
import { MintLimit } from "../components/mint-limit"
import { TokenBalance } from "../components/token-balance"
import type { FaucetToken } from "../schema"

const columnHelper = createColumnHelper<FaucetToken>()
const DEFAULT_DATA: FaucetToken[] = []

type Params = {
  data?: FaucetToken[]
}

export function useTable({ data }: Params) {
  const { chain } = useNetwork()
  const blockExplorerUrl = chain?.blockExplorers?.default.url

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Asset",
        cell: ({ row }) => {
          const { id, symbol, address } = row.original
          return (
            <Link
              href={`${blockExplorerUrl}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="flex space-x-2 items-center underline"
            >
              <TokenIcon symbol={symbol} className="h-8 w-8" />
              <span>
                <div className="text-base font-bold">{id}</div>
                <div>{symbol}</div>
              </span>
            </Link>
          )
        },
      }),
      columnHelper.display({
        header: "Wallet balance",
        cell: ({ row }) => {
          const { address } = row.original
          return (
            <div className="flex flex-col">
              {address && <TokenBalance address={address} />}
            </div>
          )
        },
      }),
      columnHelper.display({
        header: "Mint limit",
        cell: ({ row }) => {
          const { address, id } = row.original
          const isMgv = id.includes("MGV")
          if (!isMgv) return null
          return (
            <div className="flex flex-col">
              {address && <MintLimit address={address} />}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => <Actions faucetToken={row.original} />,
      }),
    ],
    [blockExplorerUrl],
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
