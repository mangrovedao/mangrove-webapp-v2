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
import { useAccount } from "wagmi"

import BlockExplorer from "@/app/strategies/[address]/_components/block-explorer"
import { TokenPair } from "@/components/token-pair"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDate } from "@/utils/date"
import type { Fill } from "./schema"

const columnHelper = createColumnHelper<Fill>()
const DEFAULT_DATA: Fill[] = []

type Params = {
  data?: Fill[]
}

export function useTable({ data }: Params) {
  const { currentMarket: market } = useMarket()
  const { chain } = useAccount()

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
      columnHelper.accessor("isMarketOrder", {
        header: "Type",
        cell: (row) => (row.getValue() ? "Market" : "Limit"),
      }),
      columnHelper.display({
        header: "Received/Sent",
        cell: ({ row }) => {
          const { takerGot, takerGave, isBid } = row.original
          if (!market) return null
          const { base, quote } = market
          const [received, sent] = isBid ? [base, quote] : [quote, base]

          return (
            <div className={cn("flex flex-col font-semibold")}>
              <span className="text-sm font-ubuntu">
                {Big(takerGot).toFixed(received.displayDecimals)}{" "}
                <span className="text-muted-foreground">{received.symbol}</span>
              </span>
              <span className="text-xs opacity-50 font-ubuntu">
                {Big(takerGave).toFixed(sent.displayDecimals)}{" "}
                <span className="text-muted-foreground">{sent.symbol}</span>
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
              <span className="font-ubuntu font-semibold">
                {Big(row.getValue()).toFixed(market.quote.displayDecimals)}{" "}
                <span className="text-muted-foreground">
                  {market.quote.symbol}
                </span>
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

      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? (
            <span className="capitalize">
              {" "}
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
              <div className="w-full h-full flex justify-end">
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
    ],
    [market],
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
