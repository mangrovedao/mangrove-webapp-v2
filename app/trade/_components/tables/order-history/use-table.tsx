"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import React from "react"
import { useAccount } from "wagmi"

import BlockExplorer from "@/app/strategies/[address]/_components/block-explorer"
import { TokenPair } from "@/components/token-pair"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate } from "@/utils/date"
import { Order } from "../(shared)/schema"

const columnHelper = createColumnHelper<Order>()
const DEFAULT_DATA: Order[] = []

type Params = {
  data?: Order[]
  showMarketInfo?: boolean
}

export function useTable({ data, showMarketInfo = false }: Params) {
  const { currentMarket: market } = useMarket()
  const { chain } = useAccount()

  const columns = React.useMemo(() => {
    const columnList = [] as any[]

    columnList.push(
      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { market } = row.original

          return (
            <div className="flex items-center space-x-2">
              <TokenPair
                titleProps={{
                  variant: "title3",
                  className: "text-xs ",
                  as: "span",
                }}
                tokenClasses="w-4 h-4"
                baseToken={market?.base}
                quoteToken={market?.quote}
              />
            </div>
          )
        },
      }),
    ),
      // Add standard columns
      columnList.push(
        columnHelper.accessor("isMarketOrder", {
          header: "Type",
          cell: ({ row }) => {
            const isMarketOrder = row.original.isMarketOrder
            return (
              <span className={cn("text-xs")}>
                {isMarketOrder ? "Market" : "Limit"}
              </span>
            )
          },
        }),
        columnHelper.accessor("side", {
          header: "Side",
          cell: ({ row }) => {
            const side = row.original.side
            return (
              <span
                className={cn(
                  side === "buy" ? "text-green-caribbean" : "text-red-100",
                  "text-xs",
                )}
              >
                {side === "buy" ? "Buy" : "Sell"}
              </span>
            )
          },
          sortingFn: "datetime",
        }),

        columnHelper.display({
          header: "Received/Sent",
          cell: ({ row }) => {
            const { takerGot, takerGave, side, market } = row.original

            if (!market) {
              return <Skeleton className="w-20 h-6" />
            }

            const [sentSymbol, receivedSymbol] =
              side === "buy"
                ? [market?.base?.symbol, market?.quote?.symbol]
                : [market?.quote?.symbol, market?.base?.symbol]

            return (
              <div className={cn("flex flex-col ")}>
                <span className="text-xs">
                  {Big(takerGot).toFixed(6)}{" "}
                  <span className="text-muted-foreground">
                    {receivedSymbol}
                  </span>
                </span>
                <span className="text-xs opacity-50 ">
                  {Big(takerGave).toFixed(6)}{" "}
                  <span className="text-muted-foreground">{sentSymbol}</span>
                </span>
              </div>
            )
          },
        }),

        columnHelper.accessor("price", {
          header: "Price",
          cell: ({ row }) => {
            const { price, market } = row.original

            if (!market || !price || isNaN(Number(price))) {
              return <Skeleton className="w-20 h-6" />
            }

            return price ? (
              <span className="text-xs">
                {Big(price).toFixed(6)}{" "}
                <span className="text-muted-foreground text-xs">
                  {market?.quote?.symbol}
                </span>
              </span>
            ) : (
              <span>-</span>
            )
          },
        }),

        columnHelper.accessor("creationDate", {
          header: "Date",
          cell: ({ row }) => {
            const date = row.original.creationDate
            return (
              <div className="text-xs">
                {formatDate(date, "dd/MM/yyyy, HH:mm")}
              </div>
            )
          },
        }),

        columnHelper.accessor("takerGot", {
          header: "Status",
          cell: ({ row }) => {
            const isFilled =
              Number(row.original.initialWants ?? "0") -
              Number(row.original.takerGot ?? "0")

            const status = isFilled === 0 ? "Filled" : "Partially Filled"

            return (
              <span className="text-xs capitalize">{status.toString()}</span>
            )
          },
        }),

        columnHelper.display({
          header: "Explorer",
          cell: ({ row }) => {
            const { transactionHash } = row.original
            const blockExplorerUrl = chain?.blockExplorers?.default.url

            return (
              <div className={cn("flex flex-col")}>
                <div className="w-full h-full flex justify-end text-xs">
                  <BlockExplorer
                    address={transactionHash}
                    blockExplorerUrl={blockExplorerUrl}
                    description={false}
                  />
                </div>
              </div>
            )
          },
        }),
      )

    return columnList
  }, [market, showMarketInfo, chain?.blockExplorers?.default.url])

  return useReactTable({
    data: data || DEFAULT_DATA,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Remove pagination model
  })
}
