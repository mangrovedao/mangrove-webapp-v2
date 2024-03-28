"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { formatDate } from "@/utils/date"

const columnHelper = createColumnHelper<Parameters>()
const DEFAULT_DATA: Parameters[] = []

export type Parameters = {
  date: Date | undefined
  pricePoints: string | null | undefined
  amount: string | undefined
  stepSize: string | null | undefined
  lockedBounty: string | undefined
}

type Params = {
  data?: Parameters[]
}

export function useParametersTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: ({ row }) => {
          const { date } = row.original
          if (!date) return <div>N/A</div>
          return <div>{formatDate(date)}</div>
        },
      }),

      columnHelper.display({
        id: "pricePoints",
        header: () => <div className="text-right">No. of offers</div>,
        cell: ({ row }) => {
          const { pricePoints } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {Number(pricePoints) - 1}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "stepSize",
        header: () => <div className="text-right">Step size</div>,
        cell: ({ row }) => {
          const { stepSize } = row.original
          return (
            <div className="w-full h-full flex justify-end">{stepSize}</div>
          )
        },
      }),

      columnHelper.accessor("amount", {
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const { amount } = row.original
          return <div className="w-full h-full flex justify-end">{amount}</div>
        },
      }),

      columnHelper.display({
        id: "lockedBounty",
        header: () => <div className="text-right">Bounty</div>,
        cell: ({ row }) => {
          const { lockedBounty } = row.original
          return (
            <div className="w-full h-full flex justify-end">{lockedBounty}</div>
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
