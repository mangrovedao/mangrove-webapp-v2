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
import { useAccount, useBalance } from "wagmi"
import { StrategyHistory } from "../../../_hooks/use-strategy-history"
import useKandel from "../../../_providers/kandel-strategy"
import BlockExplorer from "../../block-explorer"

const columnHelper = createColumnHelper<Parameters>()
const DEFAULT_DATA: Parameters[] = []

export type Parameters = StrategyHistory

type Params = {
  data?: Parameters[] | null
}

export function useParametersTable({ data }: Params) {
  const { strategyStatusQuery } = useKandel()
  const { market } = strategyStatusQuery.data ?? {}
  const baseDecimals = market?.base.displayDecimals
  const quoteDecimals = market?.quote.displayDecimals
  const { address, chain } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("creationDate", {
        header: "Date",
        cell: ({ row }) => {
          const { creationDate } = row.original
          if (!creationDate) return <div>N/A</div>
          return <div>{formatDate(creationDate)}</div>
        },
      }),

      columnHelper.display({
        id: "offers",
        header: () => <div className="text-right">Nb. of offers</div>,
        cell: ({ row }) => {
          const { numberOfOrders } = row.original
          if (Number(numberOfOrders) <= 0)
            return (
              <div className="w-full h-full flex flex-col items-end">N/A</div>
            )

          return (
            <div className="w-full h-full flex justify-end">
              {Number(numberOfOrders)}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "stepSize",
        header: () => <div className="text-right">Step size</div>,
        cell: ({ row }) => {
          const { stepSize } = row.original
          if (Number(stepSize) <= 0)
            return (
              <div className="w-full h-full flex flex-col items-end">N/A</div>
            )

          return (
            <div className="w-full h-full flex justify-end">{stepSize}</div>
          )
        },
      }),

      columnHelper.display({
        id: "txhash",
        header: () => <div className="text-right">Transaction</div>,
        cell: ({ row }) => {
          const { txHash } = row.original
          if (!txHash)
            return (
              <div className="w-full h-full flex flex-col items-end">N/A</div>
            )
          return (
            <div className="w-full h-full flex justify-end">
              <BlockExplorer
                blockExplorerUrl={chain?.blockExplorers?.default.url}
                address={txHash}
                type="tx"
              />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "amount",
        header: () => <div className="text-right">Price range (min, max)</div>,
        cell: ({ row }) => {
          const { maxPrice, minPrice } = row.original
          if (!maxPrice || !minPrice)
            return (
              <div className="w-full h-full flex flex-col items-end">N/A</div>
            )

          return (
            <div className="w-full h-full flex flex-col items-end">
              <div>
                {Number(minPrice).toFixed(quoteDecimals)} {market?.base.symbol}
              </div>
              <div>
                {Number(maxPrice).toFixed(quoteDecimals)}
                {market?.quote.symbol}{" "}
              </div>
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const { askAmount, bidAmount } = row.original
          if (!askAmount || !bidAmount)
            return (
              <div className="w-full h-full flex flex-col items-end">N/A</div>
            )
          return (
            <div className="w-full h-full flex flex-col items-end">
              <div>
                {Number(askAmount).toFixed(baseDecimals)} {market?.base.symbol}
              </div>
              <div>
                {Number(bidAmount).toFixed(quoteDecimals)}
                {market?.quote.symbol}
              </div>
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "lockedBounty",
        header: () => <div className="text-right">Bounty</div>,
        cell: ({ row }) => {
          const { bounty } = row.original
          if (!bounty) return
          return (
            <div className="w-full h-full flex justify-end">
              {Number(bounty).toFixed(6)} {nativeBalance?.symbol}
            </div>
          )
        },
      }),
    ],
    [chain?.blockExplorers?.default.url, market?.base, market?.quote],
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
