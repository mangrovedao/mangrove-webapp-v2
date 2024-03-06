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
import Link from "next/link"
import { OpenOrders } from "./schema"

const columnHelper = createColumnHelper<OpenOrders>()
const DEFAULT_DATA: OpenOrders[] = []

type Params = {
  data?: OpenOrders[]
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
        id: "filled-amount",
        header: () => (
          <div className="flex items-center">
            <span>Filled/Amount</span>
            <InfoTooltip className="pb-0.5">
              Executed amount (Filled) of the total order amount (Amount).
            </InfoTooltip>
          </div>
        ),
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
      columnHelper.display({
        id: "strategy-address",
        header: () => (
          <div className="flex items-center">
            <span>Strategy address </span>
            <InfoTooltip className="pb-0.5">
              EVM address for your strategy.
            </InfoTooltip>
          </div>
        ),
        cell: ({ row }) => {
          const address = "0x"
          return (
            <Link href="" target="_blank" className="underline">
              {address}
            </Link>
          )
        },
      }),
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
        id: "return",
        header: () => (
          <div className="flex items-center">
            <span>Return (%)</span>
            <InfoTooltip className="pb-0.5">
              EVM address for your strategy.
            </InfoTooltip>
          </div>
        ),
        cell: ({ row }) => {
          const percent = 5
          return (
            <span className="text-sm text-muted-foreground">{percent} %</span>
          )
        },
        enableSorting: true,
      }),
      columnHelper.display({
        id: "strategy-value",
        header: () => <div className="text-right">Stratedy value ($)</div>,
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
