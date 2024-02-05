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
        header: "Asset",
        cell: ({ row }) => {
          const { asset } = row.original

          return (
            asset && (
              <Text className="text-primary"> {asset.toUpperCase()}</Text>
            )
          )
        },
      }),
      columnHelper.display({
        header: "Amount",
        cell: ({ row }) => {
          const { amount, asset } = row.original
          return (
            amount &&
            asset && (
              <Text className="text-primary">
                {amount.toUpperCase()} {asset.toUpperCase()}
              </Text>
            )
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
