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

import { TokenIcon } from "@/components/token-icon"
import { Token } from "@mangrovedao/mgv"
import Link from "next/link"
import { Actions } from "../components/actions"
import { MintLimit } from "../components/mint-limit"
import { TokenBalance } from "../components/token-balance"

const columnHelper = createColumnHelper<Token>()
const DEFAULT_DATA: Token[] = []

type Params = {
  data?: Token[]
}

export function useTable({ data }: Params) {
  const { chain } = useAccount()
  const blockExplorerUrl = chain?.blockExplorers?.default.url

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Asset",
        cell: ({ row }) => {
          const { symbol, address } = row.original
          return (
            <Link
              href={`${blockExplorerUrl}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="flex space-x-2 items-center underline"
            >
              <TokenIcon symbol={symbol} className="h-8 w-8" />
              <span>
                <div className="text-base font-bold">{address}</div>
                <div>{symbol}</div>
              </span>
            </Link>
          )
        },
      }),
      columnHelper.display({
        header: "Wallet balance",
        cell: ({ row }) => {
          const { address, symbol } = row.original
          return (
            <div className="flex flex-col">
              {address && <TokenBalance address={address} symbol={symbol} />}
            </div>
          )
        },
      }),
      columnHelper.display({
        header: "Mint limit",
        cell: ({ row }) => {
          const { address, mgvTestToken } = row.original
          if (!mgvTestToken) return null
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
