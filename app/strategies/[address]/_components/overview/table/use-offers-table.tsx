"use client"

import { TooltipInfo } from "@/svgs"
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { StatusBadge } from "@/app/strategies/new/_components/price-range/components/price-chart/merged-offer-tooltip"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/utils"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffer, MergedOffers } from "../../../_utils/inventory"

const columnHelper = createColumnHelper<MergedOffer>()
const DEFAULT_DATA: MergedOffers = []

type Params = {
  data?: MergedOffers
}

export function useOffersTable({ data }: Params) {
  const { strategyStatusQuery } = useKandel()
  const market = strategyStatusQuery.data?.market
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("offerType", {
        header: "Side",
        cell: (row) => {
          const isBid = row.getValue() === "bids"
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
              {Number(price).toFixed(market?.quote.displayedDecimals)}{" "}
              {market?.quote.symbol}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "base",
        header: () => (
          <div className="flex justify-end text-right items-center">
            Base
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger className="hover:opacity-80 transition-opacity">
                  <TooltipInfo />
                </TooltipTrigger>
                <TooltipContent>Asset to be sent.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        cell: ({ row }) => {
          const { base } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {Number(base).toFixed(market?.base.displayedDecimals)}{" "}
              {market?.base.symbol}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "quote",
        header: () => (
          <div className="flex justify-end text-right items-center">
            Quote
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger className="hover:opacity-80 transition-opacity">
                  <TooltipInfo />
                </TooltipTrigger>
                <TooltipContent>Asset to be received.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        cell: ({ row }) => {
          const { quote } = row.original
          return (
            <div className="w-full h-full flex justify-end">
              {Number(quote).toFixed(market?.quote.displayedDecimals)}{" "}
              {market?.quote.symbol}
            </div>
          )
        },
      }),
      columnHelper.accessor("live", {
        id: "status",
        header: () => <div className="text-right">Status</div>,
        cell: (row) => {
          const isLive = row.getValue()
          return (
            <div className="w-full h-full flex justify-end">
              <StatusBadge isLive={isLive} />
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
