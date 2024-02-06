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
import BlockExplorer from "../../block-explorer"

const columnHelper = createColumnHelper<Parameters>()
const DEFAULT_DATA: Parameters[] = []

export type Parameters = {
  date: Date
  spread: string
  ratio: string
  pricePoints: string
  amount: string
  txHash: string
}

type Params = {
  data?: Parameters[]
}

export function useParametersTables({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "date",
        cell: ({ row }) => {
          const { date } = row.original
          return <div>{formatDate(date)}</div>
        },
      }),

      columnHelper.display({
        id: "spread",
        header: () => <div className="text-right">Spread</div>,
        cell: ({ row }) => {
          const { spread } = row.original
          return <div className="w-full h-full flex justify-end">{spread}</div>
        },
      }),

      columnHelper.display({
        id: "ratio",
        header: () => <div className="text-right">Ratio</div>,
        cell: ({ row }) => {
          const { ratio } = row.original
          return <div className="w-full h-full flex justify-end">{ratio}</div>
        },
      }),

      columnHelper.display({
        id: "pricePoints",
        header: () => <div className="text-right">No. of Price Points</div>,
        cell: ({ row }) => {
          const { pricePoints } = row.original
          return (
            <div className="w-full h-full flex justify-end">{pricePoints}</div>
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
      columnHelper.accessor("txHash", {
        id: "txHash",
        header: () => <div className="text-right">Transaction Hash</div>,
        cell: ({ row }) => {
          const { txHash } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              <BlockExplorer address={txHash} description={false} />
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
