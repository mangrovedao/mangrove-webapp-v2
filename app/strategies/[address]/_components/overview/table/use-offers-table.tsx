"use client"

import { OfferParsed } from "@mangrovedao/mgv"
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { formatUnits } from "viem"

import { StatusBadge } from "@/app/strategies/new/_components/price-range/components/price-chart/merged-offer-tooltip"
import { cn } from "@/utils"
import { BA, inboundFromOutbound } from "@mangrovedao/mgv/lib"
import useKandel from "../../../_providers/kandel-strategy"

const columnHelper = createColumnHelper<OfferParsed>()
const DEFAULT_DATA: OfferParsed[] = []

type Params = {
  data?: OfferParsed[]
}

export function useOffersTable({ data }: Params) {
  const { strategyStatusQuery } = useKandel()
  const market = strategyStatusQuery.data?.market
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("ba", {
        header: "Side",
        cell: ({ row }) => {
          const { ba } = row.original
          const isBid = ba === BA.bids
          return (
            <div
              className={cn(isBid ? "text-green-caribbean" : "text-red-100")}
            >
              {isBid ? "Bid / Buy" : "Ask / Sell"}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
          const { price } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {Number(price).toFixed(market?.quote.displayDecimals)}{" "}
              {market?.quote.symbol}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "base",
        header: () => (
          <div className="flex justify-end text-right items-center">Base</div>
        ),
        cell: ({ row }) => {
          const { gives, tick, ba } = row.original
          const wants = inboundFromOutbound(tick, gives)
          const base = ba === BA.bids ? wants : gives
          return (
            <div className="w-full h-full flex justify-end">
              {Number(formatUnits(base, market?.base.decimals || 18)).toFixed(
                market?.base.displayDecimals,
              )}{" "}
              {market?.base.symbol}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "quote",
        header: () => (
          <div className="flex justify-end text-right items-center">Quote</div>
        ),
        cell: ({ row }) => {
          const { gives, tick, ba } = row.original
          const wants = inboundFromOutbound(tick, gives)
          const quote = ba === BA.bids ? gives : wants
          return (
            <div className="w-full h-full flex justify-end">
              {Number(formatUnits(quote, market?.base.decimals || 18)).toFixed(
                market?.quote.displayDecimals,
              )}{" "}
              {market?.quote.symbol}
            </div>
          )
        },
      }),
      columnHelper.accessor("gives", {
        id: "status",
        header: () => <div className="text-right">Status</div>,
        cell: ({ row }) => {
          const { gives } = row.original

          return (
            <div className="w-full h-full flex justify-end">
              <StatusBadge isLive={gives > 0} />
            </div>
          )
        },
      }),
    ],
    [market],
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
