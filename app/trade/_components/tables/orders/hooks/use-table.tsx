"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import React from "react"

import { IconButton } from "@/components/icon-button"
import { TokenPair } from "@/components/token-pair"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import useMarket from "@/providers/market"
import { Close } from "@/svgs"
import { cn } from "@/utils"
import { formatNumber } from "@/utils/numbers"
import { getExactWeiAmount } from "@/utils/regexp"
import { MarketParams } from "@mangrovedao/mgv"
import { Timer } from "../components/timer"

import { Order } from "../../(shared)/schema"
import { useCancelOrder } from "./use-cancel-order"

const columnHelper = createColumnHelper<Order>()
const DEFAULT_DATA: Order[] = []

type Params = {
  data?: Order[]
  showMarketInfo?: boolean
  onCancel: (order: Order) => void
  onEdit: (order: Order) => void
}

export function useTable({
  data,
  showMarketInfo = false,
  onCancel,
  onEdit,
}: Params) {
  const { currentMarket: market } = useMarket()

  const columnList = React.useMemo(() => {
    const columns = [] as any[]

    columns.push(
      columnHelper.display({
        header: "Market",
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
                baseToken={market.base}
                quoteToken={market.quote}
              />
            </div>
          )
        },
      }),
    ),
      // Rest of the columns
      columns.push(
        columnHelper.accessor("side", {
          header: "Side",
          cell: (row) => {
            const isBid = row.row.original.side === "buy"
            return (
              <div
                className={cn(
                  isBid ? "text-green-caribbean" : "text-red-100",
                  "text-xs",
                )}
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
            const { initialWants, takerGot, market, initialGives } =
              row.original

            const progress = Math.min(
              Math.round(
                Big(takerGot)
                  .mul(100)
                  .div(Big(initialWants ?? 0).eq(0) ? 1 : initialWants ?? 0)
                  .toNumber(),
              ),
              100,
            )
            return (
              <div className={cn("flex items-center")}>
                <CircularProgressBar progress={progress} className="mr-2" />
                <span className="text-xs text-muted-foreground">
                  {getExactWeiAmount(takerGot, 6)}
                  &nbsp;/
                </span>
                <span className="text-xs">
                  &nbsp;
                  {getExactWeiAmount(initialGives ?? "0", 6)}{" "}
                  {market.quote.symbol}
                </span>
              </div>
            )
          },
          enableSorting: false,
        }),
        columnHelper.accessor("price", {
          header: "Price",
          cell: ({ row }) => {
            const { market, price } = row.original

            if (!price || isNaN(Number(price)))
              return <span className="text-xs">-</span>

            const displayDecimals = market.quote.displayDecimals || 6

            return price ? (
              <span className="text-xs">
                {formatNumber(Big(price).toNumber(), {
                  maximumFractionDigits: displayDecimals,
                  minimumFractionDigits: displayDecimals,
                })}{" "}
                {market.quote.symbol}
              </span>
            ) : (
              <span className="text-xs">-</span>
            )
          },
        }),
        columnHelper.accessor("expiryDate", {
          header: "Expiry",
          cell: ({ row }) => {
            const { expiryDate } = row.original

            return expiryDate ? (
              <Timer expiry={expiryDate} />
            ) : (
              <span className="text-xs">-</span>
            )
          },
        }),
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Action</div>,
          cell: ({ row }) => {
            const { market } = row.original

            const cancelOrder = useCancelOrder({
              offerId: row.original.offerId,
              market: market as MarketParams,
            })

            return (
              <div className="w-full h-full flex justify-end space-x-1">
                <IconButton
                  tooltip="Close offer"
                  className="aspect-square w-6 rounded-full"
                  isLoading={cancelOrder.isPending}
                  disabled={cancelOrder.isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    cancelOrder.mutate({
                      order: row.original as Order,
                    })
                  }}
                >
                  <Close />
                </IconButton>
              </div>
            )
          },
        }),
      )

    return columns
  }, [market, onEdit, onCancel, showMarketInfo])

  return useReactTable({
    data: data || DEFAULT_DATA,
    columns: columnList,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
