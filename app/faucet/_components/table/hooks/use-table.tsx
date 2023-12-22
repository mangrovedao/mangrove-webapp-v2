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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { FaucetToken } from "../schema"
import { TokenBalance } from "../token-balance"

const columnHelper = createColumnHelper<FaucetToken>()
const DEFAULT_DATA: FaucetToken[] = []

type Params = {
  data?: FaucetToken[]
  onFaucet: (token: FaucetToken) => void
}

export function useTable({ data, onFaucet }: Params) {
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
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const isMgv = row.original.id.includes("MGV")
          return (
            <div className="flex justify-end w-full">
              {isMgv ? (
                <Button size="sm" onClick={() => onFaucet(row.original)}>
                  Faucet
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link
                    href={
                      "https://staging.aave.com/faucet/?marketName=proto_mumbai_v3"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Go to AAVE faucet
                  </Link>
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    [onFaucet],
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
