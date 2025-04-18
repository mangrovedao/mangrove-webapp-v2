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
import { formatNumber } from "@/utils/numbers"
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
          const { type, baseAmount, quoteAmount } = row.original
          if (!market) return null
          const { base } = market
          const baseValue = type === "buy" ? baseAmount : quoteAmount

          return (
            <div className="flex flex-col gap-0">
              <span
                className={cn("font-sans text-xs leading-tight", {
                  "text-green-caribbean": type === "buy",
                  "text-red-100": type === "sell",
                })}
              >
                {type === "buy" ? "BUY" : "SELL"}
              </span>
              <span className="text-xs opacity-80 font-sans">
                {formatNumber(Big(baseValue).toNumber(), {
                  maximumFractionDigits: base.displayDecimals,
                  minimumFractionDigits: base.displayDecimals,
                })}{" "}
                {base.symbol}
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
                  {formatNumber(Big(row.getValue()).toNumber(), {
                    maximumFractionDigits: market.quote.displayDecimals,
                    minimumFractionDigits: market.quote.displayDecimals,
                  })}
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

      columnHelper.accessor("timestamp", {
        header: "Time",
        cell: ({ row }) => {
          const date = row.original.timestamp
          return (
            <div className="flex flex-col gap-0">
              <span className="font-sans text-xs leading-tight">
                {formatDate(new Date(date * 1000), "HH:mm:ss")}
              </span>
              <span className="text-xs opacity-70 font-sans leading-tight">
                {formatRelativeTime(new Date(date * 1000))}
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
