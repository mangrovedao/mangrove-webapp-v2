"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { useAccount } from "wagmi"

import { formatDate } from "@/utils/date"
import { DepositAndWithdraw } from "@mangrovedao/indexer-sdk/dist/src/kandel/types"
import useKandel from "../../../_providers/kandel-strategy"
import BlockExplorer from "../../block-explorer"

const columnHelper = createColumnHelper<DepositAndWithdraw>()
const DEFAULT_DATA: DepositAndWithdraw[] = []

type Params = {
  data?: DepositAndWithdraw[]
}

export function useHistoryParams({ data }: Params) {
  const { chain } = useAccount()
  const { baseToken, quoteToken } = useKandel()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
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
              {isDeposit ? "Published" : "Unpublished"}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const { amount, token } = row.original
          const amountToken = [baseToken, quoteToken].find(
            (item) => item?.address === token,
          )
          return (
            <div className="w-full h-full flex justify-end">
              {Number(amount).toFixed(amountToken?.displayDecimals)}{" "}
              {amountToken?.symbol}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "transactionHash",
        header: () => <div className="text-right">Transaction Hash</div>,
        cell: ({ row }) => {
          const { transactionHash } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url
          return (
            <div className="flex w-full justify-end">
              <BlockExplorer
                address={transactionHash}
                blockExplorerUrl={blockExplorerUrl}
                description={false}
              />
            </div>
          )
        },
      }),
    ],
    [chain?.blockExplorers?.default?.url],
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
