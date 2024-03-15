"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { TokenPair } from "@/components/token-pair"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import Big from "big.js"
import Link from "next/link"
import { Fill } from "./schema"
import { shortenAddress } from "@/utils/wallet"
import { Ban, Check, ExternalLinkIcon } from "lucide-react"

const columnHelper = createColumnHelper<Fill>()
const DEFAULT_DATA: Fill[] = []

type Params = {
  data?: Fill[]
}

export function useTable({ data }: Params) {
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
      columnHelper.accessor("isMarketOrder", {
        header: "Type",
        cell: (row) => (row.getValue() ? "Market" : "Limit"),
      }),
      columnHelper.display({
        header: "Filled/Amount",
        cell: ({ row }) => {
          const { initialWants, takerGot, isBid } = row.original
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
        enableSorting: true,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const { status } = row.original
          const isFilled = status === "FILLED"
          return (
            <div
              className={cn(
                "capitalize flex items-center space-x-1 px-2 py-0.5 rounded",
                isFilled
                  ? "text-green-caribbean bg-primary-dark-green"
                  : "text-red-100 bg-red-950 ",
              )}
            >
              {isFilled ? <Check size={15} /> : <Ban size={15} />}
              <span className="pt-0.5">
                {isFilled ? "Filled" : status.toLowerCase()}
              </span>
            </div>
          )
        },
        sortingFn: "datetime",
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const { transactionHash } = row.original
          return (
            <Link
              href={`https://blastscan.io/tx/${transactionHash}`}
              target="_blank"
              className="underline flex justify-end space-x-2 w-full"
            >
              <ExternalLinkIcon size={16} />
              <span>{shortenAddress(transactionHash)}</span>
            </Link>
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
