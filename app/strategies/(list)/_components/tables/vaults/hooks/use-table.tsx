"use client"

import type { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { formatUnits } from "viem"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  type: "user" | "all"
  data?: Vault[]
}

export function useTable({ type, data }: Params) {
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Pair",
        cell: ({ row }) => {
          const {
            market: {
              base: { address: base },
              quote: { address: quote },
            },
          } = row.original
          return <Market base={base} quote={quote} />
        },
      }),
      // TODO: get from indexer
      columnHelper.display({
        header: "Vault fee",
        cell: ({ row }) => {
          const { fees } = row.original
          return <div className="flex flex-col">{(fees * 100).toFixed(2)}%</div>
        },
      }),
      // TODO: get from indexer
      columnHelper.display({
        header: "TVL",
        cell: ({ row }) => {
          const {
            totalBase,
            totalQuote,
            market: { base, quote },
          } = row.original
          // return <div className="flex flex-col">$1 2345 678</div>
          if (!base || !quote || !totalBase || !totalQuote) return "-"
          return (
            <Value
              base={base.address}
              baseValue={Number(
                formatUnits(totalBase, base.decimals),
              ).toLocaleString(undefined, {
                maximumFractionDigits: base.displayDecimals,
              })}
              quote={quote.address}
              quoteValue={Number(
                formatUnits(totalQuote, quote.decimals),
              ).toLocaleString(undefined, {
                maximumFractionDigits: quote.displayDecimals,
              })}
            />
          )
        },
      }),
      columnHelper.display({
        header: "Balance",
        cell: ({ row }) => {
          const {
            balanceBase,
            balanceQuote,
            market: { base, quote },
          } = row.original
          // return <div className="flex flex-col">$1 2345 678</div>
          return (
            <Value
              base={base.address}
              baseValue={Number(
                formatUnits(balanceBase, base.decimals),
              ).toLocaleString(undefined, {
                maximumFractionDigits: base.displayDecimals,
              })}
              quote={quote.address}
              quoteValue={Number(
                formatUnits(balanceQuote, quote.decimals),
              ).toLocaleString(undefined, {
                maximumFractionDigits: quote.displayDecimals,
              })}
            />
          )
        },
      }),
      columnHelper.display({
        header: "PnL",
        cell: ({ row }) => {
          const { pnl: ret } = row.original
          return (
            <div className="flex flex-col">
              <div style={{ color: Number(ret) >= 0 ? "green" : "red" }}>
                {Number.isNaN(ret as number) ? "-" : Number(ret).toFixed(6)}
              </div>
            </div>
          )
        },
      }),

      // TODO: get from indexer
      columnHelper.display({
        header: "Strategist",
        cell: ({ row }) => {
          const { strategist } = row.original
          return (
            <div className="flex flex-col">
              {/* <ArrowBigDownDashIcon /> */}
              {strategist}
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
