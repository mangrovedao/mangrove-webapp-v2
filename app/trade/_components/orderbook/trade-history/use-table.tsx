"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate, formatRelativeTime } from "@/utils/date"
import type { TradeHistory } from "../trade-history/schema"

const columnHelper = createColumnHelper<TradeHistory>()
const DEFAULT_DATA: TradeHistory[] = []

type Params = {
  data?: TradeHistory[]
}

export function useTable({ data }: Params) {
  const { currentMarket: market } = useMarket()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Type/Size",
        cell: ({ row }) => {
          const { takerGot, takerGave, isBid } = row.original
          if (!market) return null
          const { base } = market
          const baseValue = isBid ? takerGot : takerGave

          return (
            <div className="flex flex-col gap-0">
              <span
                className={cn("font-sans text-xs leading-tight", {
                  "text-green-caribbean": isBid,
                  "text-red-100": !isBid,
                })}
              >
                {isBid ? "BUY" : "SELL"}
              </span>
              <span className="text-xs opacity-80 font-sans">
                {Big(baseValue).toFixed(base.displayDecimals)} {base.symbol}
              </span>
            </div>
          )
        },
      }),

      columnHelper.accessor("price", {
        header: "Price",
        cell: (row) =>
          market ? (
            row.getValue() ? (
              <div className="flex flex-col gap-0">
                <span className="font-sans text-xs leading-tight">
                  {Big(row.getValue()).toFixed(market.quote.displayDecimals)}
                </span>
                <span className="text-xs opacity-80 font-sans leading-tight">
                  {market.quote.symbol}
                </span>
              </div>
            ) : (
              <span>-</span>
            )
          ) : (
            <Skeleton className="w-20 h-6" />
          ),
      }),

      columnHelper.accessor("creationDate", {
        header: "Time",
        cell: ({ row }) => {
          const date = row.original.creationDate
          return (
            <div className="flex flex-col gap-0">
              <span className="font-sans text-xs leading-tight">
                {formatDate(date, "HH:mm:ss")}
              </span>
              <span className="text-xs opacity-70 font-sans leading-tight">
                {formatRelativeTime(date)}
              </span>
            </div>
          )
        },
      }),
    ],
    [market],
  )

  return useReactTable({
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: data?.length ?? 500,
      },
    },
    data: data ?? DEFAULT_DATA,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
