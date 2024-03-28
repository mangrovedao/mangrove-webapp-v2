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
import { TokenPair } from "@/components/token-pair"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import Big from "big.js"
import { IconButton } from "@/components/icon-button"
import { Close, Pen } from "@/svgs"
import { Order } from "@/app/trade/_components/tables/orders/schema"
import { Timer } from "@/app/trade/_components/tables/orders/components/timer"

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
        enableSorting: true,
      }),
      columnHelper.display({
        id: "date",
        header: "Date",
        cell: ({ row }) => {
          const { creationDate } = row.original
          return creationDate ? new Date(creationDate).toDateString() : ""
        },
        enableSorting: true,
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
          const quoteSymbol = market?.quote.symbol
          const symbol = isBid ? baseSymbol : quoteSymbol
          const displayDecimals = isBid
            ? market?.base.displayedDecimals
            : market?.quote.displayedDecimals

          const amount = Big(initialWants).toFixed(displayDecimals)
          const filled = Big(takerGot).toFixed(displayDecimals)
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
                {amount} {symbol}
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
        id: "time-in-force",
        header: () => (
          <div className="flex items-center">
            <span>Time in force left</span>
            <InfoTooltip className="pb-0.5">
              Time left until your order becomes inactive.
            </InfoTooltip>
          </div>
        ),
        cell: (row) => {
          const expiry = row.getValue()
          return expiry ? <Timer expiry={expiry} /> : <div>-</div>
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const { expiryDate } = row.original
          const isExpired = expiryDate
            ? new Date(expiryDate) < new Date()
            : true

          return (
            <div className="w-full h-full flex justify-end space-x-1">
              <IconButton
                tooltip="Modify"
                className="aspect-square w-6 rounded-full"
                disabled={isExpired}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(row.original)
                }}
              >
                <Pen />
              </IconButton>
              <IconButton
                tooltip="Retract offer"
                className="aspect-square w-6 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCancel(row.original)
                }}
              >
                <Close />
              </IconButton>
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
