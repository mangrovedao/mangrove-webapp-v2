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
import { MyStrategies } from "./schema"

const columnHelper = createColumnHelper<MyStrategies>()
const DEFAULT_DATA: MyStrategies[] = []

type Params = {
  data?: MyStrategies[]
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
          <div className="flex items-center justify-end">
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
