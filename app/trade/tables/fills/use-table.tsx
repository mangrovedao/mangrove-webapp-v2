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

import { TokenIcon } from "@/components/token-icon"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate } from "@/utils/date"
import type { Fill } from "./schema"

const columnHelper = createColumnHelper<Fill>()
const DEFAULT_DATA: Fill[] = []

type Params = {
  data?: Fill[]
  onRetract: (fill: Fill) => void
  onEdit: (fill: Fill) => void
}

export function useTable({ data, onRetract, onEdit }: Params) {
  const { market } = useMarket()
  const columns = React.useMemo(
    () => [
      columnHelper.accessor((_) => _, {
        header: "Market",
        cell: () => (
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {market ? (
                <>
                  <TokenIcon symbol={market.base.symbol} />
                  <TokenIcon symbol={market.quote.symbol} />{" "}
                </>
              ) : (
                <>
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                </>
              )}
            </div>
            {market ? (
              <span>
                {market.base.symbol}/{market.quote.symbol}
              </span>
            ) : (
              <Skeleton className="w-20 h-6" />
            )}
          </div>
        ),
      }),
      columnHelper.accessor("isBid", {
        header: "Side",
        cell: (row) => {
          const isBid = row.getValue()
          return (
            <div
              className={cn(isBid ? "text-green-caribbean" : "text-red-100")}
            >
              {isBid ? "Buy" : "Sell"}
            </div>
          )
        },
        sortingFn: "datetime",
      }),
      // TODO: change when we will have amplified orders
      columnHelper.accessor("isMarketOrder", {
        header: "Type",
        cell: (row) => (row.getValue() ? "Market" : "Limit"),
      }),
      columnHelper.accessor((_) => _, {
        header: "Received/Sent",
        cell: ({ row }) => {
          const { takerGot, takerGave, isBid } = row.original
          if (!market) return null
          const { base, quote } = market
          const [received, sent] = isBid ? [base, quote] : [quote, base]
          return (
            <div className={cn("flex flex-col")}>
              <span className="text-sm">
                {Big(takerGot).toFixed(received.displayedDecimals)}{" "}
                {received.symbol}
              </span>
              <span className="text-xs opacity-50">
                {Big(takerGave).toFixed(sent.displayedDecimals)} {sent.symbol}
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
              <span>
                {Big(row.getValue()).toFixed(market.quote.displayedDecimals)}{" "}
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
        cell: (row) => <div>{formatDate(row.getValue())}</div>,
      }),
      // columnHelper.display({
      //   id: "actions",
      //   header: () => <div className="text-right">Action</div>,
      //   cell: ({ row }) => (
      //     <div className="w-full h-full flex justify-end space-x-1">
      //       <IconButton
      //         tooltip="Modify"
      //         className="aspect-square w-6 rounded-full"
      //         onClick={() => onEdit(row.original)}
      //       >
      //         <Pen />
      //       </IconButton>
      //       <IconButton
      //         tooltip="Retract offer"
      //         className="aspect-square w-6 rounded-full"
      //         onClick={() => onRetract(row.original)}
      //       >
      //         <Close />
      //       </IconButton>
      //     </div>
      //   ),
      // }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [market?.base.address, market?.quote.address, onRetract, onEdit],
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
