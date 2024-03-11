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
import useMarket from "@/providers/market"
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
