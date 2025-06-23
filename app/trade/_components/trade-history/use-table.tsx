"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import React from "react"

import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate, formatRelativeTime } from "@/utils/date"
import { formatNumber } from "@/utils/numbers"
import { BS } from "@mangrovedao/mgv/lib"
import { useTradeFormStore } from "../forms/store"
import type { TradeHistory } from "./schema"

const columnHelper = createColumnHelper<TradeHistory>()

type Params = {
  data?: TradeHistory[]
}

export function useTable({ data = [] }: Params) {
  const { currentMarket: market } = useMarket()
  const { tradeSide } = useTradeFormStore()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Type/Size",
        cell: ({ row }) => {
          const { type, baseAmount, quoteAmount, price } = row.original
          if (!market) return null

          const { base } = market
          const baseValue = baseAmount

          return (
            <div className="flex flex-col gap-0">
              <span
                className={cn("font-sans text-xs leading-tight", {
                  "text-green-caribbean": type === BS.buy,
                  "text-red-100": type === BS.sell,
                })}
              >
                {type.toUpperCase()}
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
        cell: (row) => {
          return row.getValue() ? (
            <div className="flex flex-col gap-0">
              <span className="font-sans text-xs leading-tight">
                {row.getValue().toFixed(market.quote.displayDecimals)}
              </span>
              <span className="text-xs opacity-80 font-sans leading-tight">
                {market.quote.symbol}
              </span>
            </div>
          ) : (
            <span>-</span>
          )
        },
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
    [market, tradeSide],
  )

  const processed = useReactTable({
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: data?.length ?? 500,
      },
    },
    data,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
  })

  return processed
}
