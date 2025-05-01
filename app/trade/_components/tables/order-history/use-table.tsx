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
import { useTokenFromId } from "@/hooks/use-token-from-id"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate } from "@/utils/date"
import { Address } from "viem"
import type { OrderHistory } from "./schema"

const columnHelper = createColumnHelper<OrderHistory>()
const DEFAULT_DATA: OrderHistory[] = []

type Params = {
  data?: OrderHistory[]
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
          const { baseAddress, quoteAddress } = row.original

          const { data: baseToken } = useTokenFromId(baseAddress as Address)
          const { data: quoteToken } = useTokenFromId(quoteAddress as Address)

          return (
            <div className="flex items-center space-x-2">
              <TokenPair
                titleProps={{
                  variant: "title3",
                  className: "text-xs ",
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
        columnHelper.accessor("isBid", {
          header: "Side",
          cell: ({ row }) => {
            const isBid = row.original.isBid
            return (
              <span
                className={cn(
                  !isBid ? "text-green-caribbean" : "text-red-100",
                  "text-xs",
                )}
              >
                {!isBid ? "Buy" : "Sell"}
              </span>
            )
          },
          sortingFn: "datetime",
        }),

        columnHelper.display({
          header: "Received/Sent",
          cell: ({ row }) => {
            const { takerGot, takerGave, isBid, marketBase, marketQuote } =
              row.original

            // Determine base and quote symbols/decimals
            let baseSymbol, quoteSymbol, baseDecimals, quoteDecimals

            if (showMarketInfo && marketBase && marketQuote) {
              baseSymbol = marketBase
              quoteSymbol = marketQuote
              baseDecimals = 6 // Default for multi-market view
              quoteDecimals = 6 // Default for multi-market view
            } else if (market) {
              baseSymbol = market.base.symbol
              quoteSymbol = market.quote.symbol
              baseDecimals = market.base.displayDecimals
              quoteDecimals = market.quote.displayDecimals
            } else {
              return <Skeleton className="w-20 h-6" />
            }

            const [receivedSymbol, sentSymbol] = isBid
              ? [baseSymbol, quoteSymbol]
              : [quoteSymbol, baseSymbol]
            const [receivedDecimals, sentDecimals] = isBid
              ? [baseDecimals, quoteDecimals]
              : [quoteDecimals, baseDecimals]

            return (
              <div className={cn("flex flex-col ")}>
                <span className="text-xs">
                  {Big(takerGot).toFixed(receivedDecimals)}{" "}
                  <span className="text-muted-foreground">
                    {receivedSymbol}
                  </span>
                </span>
                <span className="text-xs opacity-50 ">
                  {Big(takerGave).toFixed(sentDecimals)}{" "}
                  <span className="text-muted-foreground">{sentSymbol}</span>
                </span>
              </div>
            )
          },
        }),

        columnHelper.accessor("price", {
          header: "Price",
          cell: ({ row }) => {
            const { price, marketQuote } = row.original

            // Determine quote symbol and decimals
            let priceQuoteSymbol, priceQuoteDecimals

            if (showMarketInfo && marketQuote) {
              priceQuoteSymbol = marketQuote
              priceQuoteDecimals = 6 // Default for multi-market view
            } else if (market) {
              priceQuoteSymbol = market.quote.symbol
              priceQuoteDecimals = market.quote.displayDecimals
            } else {
              return <Skeleton className="w-20 h-6" />
            }

            return price ? (
              <span className="text-xs">
                {Big(price).toFixed(priceQuoteDecimals)}{" "}
                <span className="text-muted-foreground text-xs">
                  {priceQuoteSymbol}
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

        columnHelper.accessor("status", {
          header: "Status",
          cell: ({ row }) =>
            row.original.status ? (
              <span className="text-xs capitalize">
                {row.original.status.toLowerCase()}
              </span>
            ) : (
              <Skeleton className="w-20 h-6" />
            ),
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
