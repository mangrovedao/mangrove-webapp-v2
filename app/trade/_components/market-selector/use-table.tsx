"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { TokenPair } from "@/components/token-pair"
import { VariationArrow } from "@/svgs"
import { cn } from "@/utils"
import { Token } from "@mangrovedao/mgv"
import { Skeleton } from "@/components/ui/skeleton"

export type OHLCVData = {
  market: {
    base: Token
    quote: Token
    tickSpacing: bigint | number
  }
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
  price: number | null
  dailyChange: number | null
  dailyPercentChange: number | null
  variantDailyPrice: string;
}

const columnHelper = createColumnHelper<OHLCVData>()

type Params = {
  data: OHLCVData[]
}

export function useTable({ data }: Params) {
  const columnList = React.useMemo(() => {
    const columns = [] as any[]

    columns.push(
      columnHelper.display({
        header: "Symbol",
        cell: ({ row }) => {
          const { market } = row.original
          return (
            <div className="flex items-center space-x-2">
              <TokenPair
                titleProps={{
                  variant: "title3",
                  className: "text-xs font-normal",
                  as: "span",
                }}
                tokenClasses="w-4 h-4"
                baseToken={market?.base}
                quoteToken={market?.quote}
              />
            </div>
          )
        },
      }),
    )

    columns.push(
      columnHelper.display({
        header: "Last price",
        cell: ({ row }) => {
          const { price } = row.original

          return (
            <div className="flex items-center space-x-2">
              {price?.toFixed(2)}
            </div>
          )
        },
      }),
    )

    columns.push(
      columnHelper.display({
        header: "24hr Change",
        cell: ({ row }) => {
          const { dailyChange, dailyPercentChange } = row.original


          const isPositive = (dailyPercentChange ?? 0) > 0
          const formatted = dailyPercentChange?.toFixed(2).replace("-", "")
          return (
            <span className="flex text-xs items-center">
              <span
                className={`${isPositive ? "text-green-caribbean" : "text-red-100"}`}
              >
                {dailyChange?.toFixed(2).replace('-', '')}
              </span>
              <span className="mx-1">/</span>
              <span
                className={`${isPositive ? "text-green-caribbean" : "text-red-100"}`}
              >
                {formatted}%
              </span>
            </span>
          )
        },
      }),
    )

    columns.push(
      columnHelper.display({
        header: "Volume",
        cell: ({ row }) => {
          const { volume } = row.original

          return (
            <div className="flex items-center space-x-2">
              {volume?.toFixed(2)}
            </div>
          )
        },
      }),
    )

    return columns
  }, [data])

  return useReactTable({
    data: data || [],
    columns: columnList,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
