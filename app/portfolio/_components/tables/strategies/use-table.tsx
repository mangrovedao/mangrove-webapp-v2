"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { IconButton } from "@/components/icon-button"
import { TokenPair } from "@/components/token-pair"
import useMarket from "@/providers/market"
import { Close, Pen } from "@/svgs"
import { cn } from "@/utils"
import { Strategies } from "./schema"

const columnHelper = createColumnHelper<Strategies>()
const DEFAULT_DATA: Strategies[] = []

type Params = {
  data?: Strategies[]
}

export function useTable({ data }: Params) {
  const { market } = useMarket()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Strategy address",
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
        header: "Balance",
      }),
      columnHelper.display({
        header: "Value",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (row) => {
          const isCompleted = row.getValue()
          return (
            <div
              className={cn(
                isCompleted ? "text-green-caribbean" : "text-red-100",
              )}
            >
              {isCompleted ? <span>Completed</span> : "Cancelled"}
            </div>
          )
        },
        sortingFn: "datetime",
      }),
      columnHelper.display({
        header: "Return (%)",
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Liquidity souce",
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end items-center space-x-1">
              <IconButton
                variant="primary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Pen />
              </IconButton>
              <IconButton
                variant="secondary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
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
