"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import React from "react"
import { useAccount } from "wagmi"

import { IconButton } from "@/components/icon-button"
import { Close, Pen } from "@/svgs"
import { ArrowBigDownDashIcon } from "lucide-react"
import type { Strategy } from "../../../../_schemas/kandels"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Strategy>()
const DEFAULT_DATA: Strategy[] = []

type Params = {
  type: "user" | "all"
  data?: Strategy[]
  onCancel: (strategy: Strategy) => void
  onManage: (strategy: Strategy) => void
}

export function useTable({ type, data, onCancel, onManage }: Params) {
  const { chain } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Pair",
        cell: ({ row }) => {
          const { base, quote } = row.original
          return <Market base={base} quote={quote} />
        },
      }),
      // TODO: get from indexer
      columnHelper.display({
        header: "Vault fee",
        cell: ({ row }) => {
          const {} = row.original
          return <div className="flex flex-col">0.5%</div>
        },
      }),
      // TODO: get from indexer
      columnHelper.display({
        header: "TVL",
        cell: ({ row }) => {
          const {} = row.original
          return <div className="flex flex-col">$1 2345 678</div>
        },
      }),
      columnHelper.display({
        header: "Balance",
        cell: ({ row }) => {
          const { base, quote, offers } = row.original
          const asksOffers = offers?.filter(
            (item) => item.offerType === "asks" && item.live,
          )
          const bidsOffers = offers?.filter(
            (item) => item.offerType === "bids" && item.live,
          )

          const baseAmountDeposited = asksOffers?.reduce((acc, curr) => {
            return acc.add(Big(curr.gives))
          }, Big(0))

          const quoteAmountDeposited = bidsOffers?.reduce((acc, curr) => {
            return acc.add(Big(curr.gives))
          }, Big(0))

          return (
            <Value
              base={base}
              baseValue={baseAmountDeposited.toFixed(6)}
              quote={quote}
              quoteValue={quoteAmountDeposited.toFixed(6)}
            />
          )
        },
      }),
      columnHelper.display({
        header: "PnL",
        cell: ({ row }) => {
          const { return: ret } = row.original
          return (
            <div className="flex flex-col">
              <div style={{ color: Number(ret) > 0 ? "green" : "red" }}>
                {isNaN(ret as number) ? "-" : Number(ret).toFixed(6)}
              </div>
            </div>
          )
        },
      }),

      // TODO: get from indexer
      columnHelper.display({
        header: "Strategist",
        cell: ({ row }) => {
          const {} = row.original
          return (
            <div className="flex flex-col">
              <ArrowBigDownDashIcon />
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const anyLiveOffers = row.original.offers.some(
            (x) => x?.live === true,
          )

          return (
            <div className="w-full h-full flex justify-end space-x-1">
              <IconButton
                tooltip="Manage"
                className="aspect-square w-6 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onManage(row.original)
                }}
              >
                <Pen />
              </IconButton>
              <IconButton
                tooltip="Cancel strategy"
                className="aspect-square w-6 rounded-full"
                disabled={!anyLiveOffers}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCancel(row.original)
                }}
              >
                <Close />
              </IconButton>
            </div>
          )
        },
      }),
    ],
    [onManage, onCancel],
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
