"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import { Pen, Trash } from "lucide-react"
import React from "react"

import { IconButton } from "@/components/icon-button"
import { TokenIcon } from "@/components/token-icon"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { MOCKS } from "./mock"
import type { Order } from "./schema"
import { Timer } from "./timer"

const columnHelper = createColumnHelper<Order>()
const DEFAULT_DATA: Order[] = [...MOCKS, ...MOCKS, ...MOCKS, ...MOCKS]

type Params = {
  data?: Order[]
  onDelete: (order: Order) => void
  onEdit: (order: Order) => void
}

export function useTable({ data, onDelete, onEdit }: Params) {
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
      columnHelper.accessor((accessor) => accessor, {
        header: "Type",
        cell: () => <span>Limit</span>,
      }),
      columnHelper.accessor((_) => _, {
        header: "Filled/Amount",
        cell: ({ row }) => {
          const { initialWants, takerGot, initialGives, isBid, takerGave } =
            row.original
          const baseSymbol = market?.base.symbol
          const displayDecimals = market?.base.displayedDecimals
          const filled = Big(isBid ? initialWants : initialGives).toFixed(
            displayDecimals,
          )
          const amount = Big(isBid ? takerGot : takerGave).toFixed(
            displayDecimals,
          )
          const progress = Math.min(
            Math.round(Big(filled).mul(100).div(amount).toNumber()),
            100,
          )
          return market ? (
            <div className={cn("flex items-center")}>
              <span className="text-sm text-muted-foreground">
                {filled}
                &nbsp;/
              </span>
              <span className="">
                &nbsp;
                {amount} {baseSymbol}
              </span>
              <CircularProgressBar progress={progress} className="ml-3" />
            </div>
          ) : (
            <Skeleton className="w-32 h-6" />
          )
        },
        enableSorting: false,
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
      columnHelper.accessor("expiryDate", {
        header: "Time in force",
        cell: (row) => {
          const expiry = row.getValue()
          return expiry ? <Timer expiry={expiry} /> : <div>-</div>
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="">
            <span className="items-center hidden gap-2 group-hover:inline-flex">
              <IconButton tooltip="Modify" onClick={() => onEdit(row.original)}>
                <Pen className="text-primary-main" />
              </IconButton>
              <IconButton
                tooltip="Retract"
                onClick={() => onDelete(row.original)}
              >
                <Trash className="text-red-500" />
              </IconButton>
            </span>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [market?.base.address, market?.quote.address, onDelete, onEdit],
  )

  return useReactTable({
    data: DEFAULT_DATA, // TODO: unmock
    // data: data ?? DEFAULT_DATA,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
