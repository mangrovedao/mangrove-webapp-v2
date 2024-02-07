"use client"

import React from "react"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Text } from "@/components/typography/text"

const columnHelper = createColumnHelper<{ asset: string; amount: string }>()
const DEFAULT_DATA: { asset: string; amount: string }[] = []

type Params = {
  data?: { asset: string; amount: string }[]
}

export function useInventoryTable({ data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "Asset",
        header: () => <div className="text-start">Asset</div>,
        cell: ({ row }) => {
          const { asset } = row.original
          return (
            <div className="w-full h-full flex justify-start">
              <Text className="text-primary"> {asset.toUpperCase()}</Text>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "Amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const { amount, asset } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              <Text className="text-primary">
                {amount.toUpperCase()} {asset.toUpperCase()}
              </Text>
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
