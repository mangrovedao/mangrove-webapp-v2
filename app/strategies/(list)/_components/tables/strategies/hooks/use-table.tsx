"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Big from "big.js"
import Link from "next/link"
import React from "react"
import { useAccount } from "wagmi"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { IconButton } from "@/components/icon-button"
import { Close, Pen } from "@/svgs"
import { shortenAddress } from "@/utils/wallet"
import Status from "../../../../../(shared)/_components/status"
import type { Strategy } from "../../../../_schemas/kandels"
import { Market } from "../components/market"
import { MinMax } from "../components/min-max"
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
        id: "addresses",
        header: () => (
          <div className="text-left">
            <div>Strategy address</div>
            <div>Wallet address</div>
          </div>
        ),
        cell: ({ row }) => {
          const { address, owner } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url
          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenAddress(address)}
              </Link>
              <Link
                className="hover:opacity-80 transition-opacity"
                href={`${blockExplorerUrl}/address/${owner}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenAddress(owner)}
              </Link>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "min-max",
        header: () => (
          <div>
            <div>Min</div>
            <div>Max</div>
          </div>
        ),
        cell: ({ row }) => {
          const { min, max, quote, base } = row.original
          return <MinMax min={min} max={max} quote={quote} base={base} />
        },
      }),
      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { base, quote } = row.original
          return <Market base={base} quote={quote} />
        },
      }),
      columnHelper.display({
        header: "Value",
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
        header: "Status",
        cell: ({ row }) => {
          const { base, quote, address, offers } = row.original
          const { data } = useStrategyStatus({
            address,
            base,
            quote,
            offers,
          })

          return <Status status={data?.status} />
        },
      }),
      // columnHelper.display({
      //   header: "PnL",
      //   cell: ({ row }) => {
      //     const { return: ret } = row.original
      //     return (
      //       <div className="flex flex-col">
      //         <div>{isNaN(ret as number) ? "-" : ret?.toString()}</div>
      //       </div>
      //     )
      //   },
      // }),
      // TODO: get from indexer
      // columnHelper.display({
      //   header: "Liquidity sourcing",
      //   cell: ({ row }) => {
      //     const {} = row.original
      //     return <div className="flex flex-col">Wallet</div>
      //   },
      // }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
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
