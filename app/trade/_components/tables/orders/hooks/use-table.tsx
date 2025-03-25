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
import { useTokenFromId } from "@/hooks/use-token-from-id"
import useMarket from "@/providers/market"
import { Close } from "@/svgs"
import { cn } from "@/utils"
import { Address } from "viem"
import { Timer } from "../components/timer"
import type { Order } from "../schema"
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
          const { baseAddress, quoteAddress } = row.original

          const { data: baseToken } = useTokenFromId(baseAddress as Address)
          const { data: quoteToken } = useTokenFromId(quoteAddress as Address)

          return (
            <div className="flex items-center space-x-2">
              <TokenPair
                titleProps={{
                  variant: "title3",
                  className: "text-sm text-current font-normal",
                  as: "span",
                }}
                tokenClasses="w-4 h-4"
                baseToken={baseToken}
                quoteToken={quoteToken}
              />
            </div>
          )
        },
      }),
    ),
      // Rest of the columns
      columns.push(
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
            const { initialWants, takerGot, isBid, baseAddress, quoteAddress } =
              row.original

            const { data: baseToken } = useTokenFromId(baseAddress as Address)
            const { data: quoteToken } = useTokenFromId(quoteAddress as Address)

            // Use market info from the row if available (for all markets view)
            // or fall back to current market
            const symbol = isBid ? baseToken?.symbol : quoteToken?.symbol

            // Determine display decimals - default to 6 if not available
            const displayDecimals = isBid
              ? baseToken?.priceDisplayDecimals || 6
              : quoteToken?.priceDisplayDecimals || 6

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
            return (
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
            )
          },
          enableSorting: false,
        }),
        columnHelper.accessor("price", {
          header: "Price",
          cell: ({ row }) => {
            const { quoteAddress, price } = row.original

            const { data: quoteToken } = useTokenFromId(quoteAddress as Address)

            return price ? (
              <span>
                {Big(price).toFixed(quoteToken?.priceDisplayDecimals)}{" "}
                {quoteToken?.symbol}
              </span>
            ) : (
              <span>-</span>
            )
          },
        }),
        columnHelper.accessor("expiryDate", {
          header: "Time in force",
          cell: ({ row }) => {
            const { expiryDate } = row.original

            return expiryDate ? <Timer expiry={expiryDate} /> : <div>-</div>
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
            const cancelOrder = useCancelOrder({
              offerId: row.original.offerId,
            })

            return (
              <div className="w-full h-full flex justify-end space-x-1">
                <IconButton
                  tooltip="Cancel offer"
                  className="aspect-square w-6 rounded-full"
                  isLoading={cancelOrder.isPending}
                  disabled={cancelOrder.isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    cancelOrder.mutate({
                      order: row.original,
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
