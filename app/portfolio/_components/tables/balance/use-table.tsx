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
import { Button } from "@/components/ui/button"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import Big from "big.js"
import { Balance } from "./schema"

const columnHelper = createColumnHelper<Balance>()
const DEFAULT_DATA: Balance[] = []

type Params = {
  data?: Balance[]
}

export function useTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Assets",
      }),
      columnHelper.display({
        header: "Wallet",
      }),
      columnHelper.display({
        header: "Liquidity sourcing",
      }),
      columnHelper.display({
        header: "Total value ($)",
      }),
      columnHelper.display({
        id: "composition",
        header: () => (
          <div className="flex items-center">
            <span>Composition</span>
            <InfoTooltip className="pb-0.5">
              Breakdown of different assets in your portfolio.
            </InfoTooltip>
          </div>
        ),
        cell: ({ row }) => {
          const percent = 51.0
          const progress = Math.min(
            Math.round(
              Big(percent)
                .mul(100)
                .div(Big(100).eq(0) ? 1 : 100)
                .toNumber(),
            ),
            100,
          )
          return percent ? (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">{percent} %</span>
              <CircularProgressBar progress={progress} className="ml-3" />
            </div>
          ) : (
            <Skeleton className="w-32 h-6" />
          )
        },
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end items-center space-x-1">
              <Button
                variant="primary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                Trade
              </Button>
              <Button
                variant="secondary"
                className="px-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                Create Stratedy
              </Button>
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
