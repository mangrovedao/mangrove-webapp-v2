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
import { formatDate } from "@/utils/date"
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
        header: "Size",
        cell: ({ row }) => {
          const { takerGot, takerGave, isBid } = row.original
          if (!market) return null
          const { base } = market
          const baseValue = isBid ? takerGot : takerGave

          return (
            <span
              className={cn({
                "text-green-caribbean": isBid,
                "text-red-100": !isBid,
              })}
            >
              {Big(baseValue).toFixed(base.displayDecimals)} {base.symbol}
            </span>
          )
        },
      }),

      columnHelper.accessor("price", {
        header: "Price",
        cell: (row) =>
          market ? (
            row.getValue() ? (
              <span>
                {Big(row.getValue()).toFixed(market.quote.displayDecimals)}{" "}
                {market.quote.symbol}
              </span>
            ) : (
              <span>-</span>
            )
          ) : (
            <Skeleton className="w-20 h-6" />
          ),
      }),

      columnHelper.accessor("creationDate", {
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.creationDate
          return <div>{formatDate(date, "dd/MM/yyyy, HH:mm")}</div>
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
