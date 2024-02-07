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
import { DepositAndWithdraw } from "@mangrovedao/indexer-sdk/dist/src/kandel/types"

const columnHelper = createColumnHelper<DepositAndWithdraw>()
const DEFAULT_DATA: DepositAndWithdraw[] = []

type Params = {
  data?: DepositAndWithdraw[]
}

export function useHistoryParams({ data }: Params) {
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
        id: "event",
        header: () => <div className="text-right">Event</div>,
        cell: ({ row }) => {
          const { isDeposit } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {isDeposit ? "Deposit" : "Withdraw"}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const { amount } = row.original
          return <div className="w-full h-full flex justify-end">{amount}</div>
        },
      }),

      columnHelper.display({
        id: "transactionHash",
        header: () => <div className="text-right">Transaction Hash</div>,
        cell: ({ row }) => {
          const { transactionHash } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {transactionHash}
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
