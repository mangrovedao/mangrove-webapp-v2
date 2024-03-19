"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { shortenAddress } from "@/utils/wallet"
import Link from "next/link"
import { Market } from "@/app/strategies/(list)/_components/tables/strategies/components/market"
import { Button } from "@/components/ui/button"
import Status from "@/app/strategies/(shared)/_components/status"
import { Value } from "@/app/strategies/(list)/_components/tables/strategies/components/value"
import { useAccount } from "wagmi"
import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Skeleton } from "@/components/ui/skeleton"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import { ValueInUSD } from "./value"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  data?: Strategy[]
  onManage: (strategy: Strategy) => void
}

export function useTable({ data, onManage }: Params) {
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
        header: "Value",
        cell: ({ row }) => {
          const { base, quote, depositedBase, depositedQuote } = row.original
          return (
            <ValueInUSD
              base={base}
              quote={quote}
              baseValue={depositedBase}
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
          const { return: returnValue } = row.original
          return (
            <div className="flex flex-col">
              <div>
                {isNaN(returnValue as number) ? "-" : returnValue?.toString()}
              </div>
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
        cell: ({ row }) => {
          const { data } = useStrategyStatus({
            address: row.original.address,
            base: row.original?.base,
            quote: row.original?.quote,
            offers: row.original?.offers,
          })
          const status = data?.status

          if (!status)
            return (
              <div className="w-full flex justify-end">
                <Skeleton className="w-20 h-5 self-end" />
              </div>
            )

          return (
            <div className="w-full h-full flex justify-end space-x-1">
              {status === "active" ? (
                <Button
                  className="flex items-center"
                  onClick={() => onManage(row.original)}
                >
                  Manage
                </Button>
              ) : (
                <Button
                  className="flex items-center"
                  // onClick={() => onManage(row.original)}
                >
                  Reopen
                </Button>
              )}
            </div>
          )
        },
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
