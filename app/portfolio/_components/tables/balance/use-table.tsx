"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
 
import { Balance } from "./schema"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { Address } from "viem"
import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { Token } from "@mangrovedao/mangrove.js"

const columnHelper = createColumnHelper<Balance>()
const DEFAULT_DATA: Balance[] = []

type Params = {
  data?: Balance[]
}

export function useTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("address", {
        header: "Assets",
        cell: ({ row }) => {
          const { address } = row.original
          const { data } = useTokenFromAddress(address as Address)
          return (
            <div className="flex items-center">
              <TokenIcon
                symbol={data?.symbol}
                imgClasses="w-10 h-10"
                className="w-10 max-h-10 rounded-full"
              />
              <div className="pl-2">
                <p>{data?.id}</p>
                <p>{data?.symbol}</p>
              </div>
            </div>
          )
        },
      }),
      columnHelper.display({
        header: "Wallet",
        cell: ({ row }) => {
          const { address } = row.original
          const { data: token } = useTokenFromAddress(address as Address)
          const { formattedWithSymbol } = useTokenBalance(token as Token)
          return <span>{formattedWithSymbol}</span>
        },
      }),
      // columnHelper.display({
      //   header: "Liquidity sourcing",
      // }),
      // columnHelper.display({
      //   header: "Total value ($)",
      // }),
      // columnHelper.display({
      //   id: "composition",
      //   header: () => (
      //     <div className="flex items-center">
      //       <span>Composition</span>
      //       <InfoTooltip className="pb-0.5">
      //         Breakdown of different assets in your portfolio.
      //       </InfoTooltip>
      //     </div>
      //   ),
      //   cell: ({ row }) => {
      //     const percent = 51.0
      //     const progress = Math.min(
      //       Math.round(
      //         Big(percent)
      //           .mul(100)
      //           .div(Big(100).eq(0) ? 1 : 100)
      //           .toNumber(),
      //       ),
      //       100,
      //     )
      //     return percent ? (
      //       <div className="flex items-center">
      //         <span className="text-sm text-muted-foreground">{percent} %</span>
      //         <CircularProgressBar progress={progress} className="ml-3" />
      //       </div>
      //     ) : (
      //       <Skeleton className="w-32 h-6" />
      //     )
      //   },
      //   enableSorting: false,
      // }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end items-center space-x-1">
              <Button
                variant="primary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                Trade
              </Button>
              <Button
                variant="secondary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                Create Stratedy
              </Button>
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
