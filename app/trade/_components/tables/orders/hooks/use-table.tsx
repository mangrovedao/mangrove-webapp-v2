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

import { IconButton } from "@/components/icon-button"
import { TokenPair } from "@/components/token-pair"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { Close, Pen } from "@/svgs"
import { cn } from "@/utils"
import { Timer } from "../components/timer"
import type { Order } from "../schema"

const columnHelper = createColumnHelper<Order>()
const DEFAULT_DATA: Order[] = []

type Params = {
  data?: Order[]
  onCancel: (order: Order) => void
  onEdit: (order: Order) => void
}

export function useTable({ data, onCancel, onEdit }: Params) {
  const { market } = useMarket()
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Market",
        cell: () => (
          <div className="flex items-center space-x-2">
            <TokenPair
              titleProps={{
                variant: "title3",
                className: "text-sm text-current font-normal",
                as: "span",
              }}
              tokenClasses="w-4 h-4"
              baseToken={market?.base}
              quoteToken={market?.quote}
            />
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
      columnHelper.display({
        header: "Type",
        cell: () => <span>Limit</span>,
      }),
      columnHelper.display({
        header: "Filled/Amount",
        cell: ({ row }) => {
          const { initialWants, takerGot, initialGives, isBid, takerGave } =
            row.original
          const baseSymbol = market?.base.symbol
          const displayDecimals = market?.base.displayedDecimals
          const amount = Big(isBid ? initialWants : initialGives).toFixed(
            displayDecimals,
          )
          const filled = Big(isBid ? takerGot : takerGave).toFixed(
            displayDecimals,
          )
          const progress = Math.min(
            Math.round(
              Big(filled)
                .mul(100)
                .div(Big(amount).eq(0) ? 1 : amount)
                .toNumber(),
            ),
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
                {Big(row.getValue()).toFixed(
                  market.quote.displayedAsPriceDecimals,
                )}{" "}
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
          <div className="w-full h-full flex justify-end space-x-1">
            <IconButton
              tooltip="Modify"
              className="aspect-square w-6 rounded-full"
              disabled
              onClick={() => onEdit(row.original)}
            >
              <Pen />
            </IconButton>
            <IconButton
              tooltip="Retract offer"
              className="aspect-square w-6 rounded-full"
              onClick={() => onCancel(row.original)}
            >
              <Close />
            </IconButton>
          </div>
        ),
      }),
    ],
    [market, onEdit, onCancel],
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
