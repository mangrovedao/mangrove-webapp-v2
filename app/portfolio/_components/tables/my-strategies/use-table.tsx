"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import InfoTooltip from "@/components/info-tooltip"
import Link from "next/link"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useAccount } from "wagmi"
import { shortenAddress } from "@/utils/wallet"
import { Market } from "@/app/strategies/(list)/_components/tables/strategies/components/market"
import { Value } from "@/app/strategies/(list)/_components/tables/strategies/components/value"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  data?: Strategy[]
}

export function useTable({ data }: Params) {
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
        id: "return",
        header: () => (
          <div className="flex items-center">
            <span>Return (%)</span>
            <InfoTooltip className="pb-0.5">
              EVM address for your strategy.
            </InfoTooltip>
          </div>
        ),
        cell: ({ row }) => {
          const { return: ret } = row.original
          return (
            <div className="flex flex-col">
              <div>{isNaN(ret as number) ? "-" : ret?.toString()}</div>
            </div>
          )
        },
        enableSorting: true,
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
