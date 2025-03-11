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

import { IconButton } from "@/components/icon-button"
import { TokenPair } from "@/components/token-pair"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { Close, Pen } from "@/svgs"
import { cn } from "@/utils"
import { Timer } from "../components/timer"
import type { Order } from "../schema"

const columnHelper = createColumnHelper<Order>()
const DEFAULT_DATA: Order[] = []

// Mock data for orders when no data is available
const MOCK_DATA: Order[] = [
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 30),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    transactionHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    isBid: true,
    takerGot: "0.5",
    takerGave: "1000",
    penalty: "0",
    feePaid: "0.5",
    initialWants: "1",
    initialGives: "2000",
    price: "2000",
    offerId: "1",
    inboundRoute: "",
    outboundRoute: "",
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 15),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    transactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    isBid: false,
    takerGot: "800",
    takerGave: "0.4",
    penalty: "0",
    feePaid: "0.2",
    initialWants: "1000",
    initialGives: "0.5",
    price: "2000",
    offerId: "2",
    inboundRoute: "",
    outboundRoute: "",
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 5),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
    transactionHash:
      "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    isBid: true,
    takerGot: "0",
    takerGave: "0",
    penalty: "0",
    feePaid: "0",
    initialWants: "0.75",
    initialGives: "1500",
    price: "2000",
    offerId: "3",
    inboundRoute: "",
    outboundRoute: "",
  },
]

type Params = {
  data?: Order[]
  onCancel: (order: Order) => void
  onEdit: (order: Order) => void
}

export function useTable({ data, onCancel, onEdit }: Params) {
  const { currentMarket: market } = useMarket()
  // Use mock data if data is empty or undefined
  const tableData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return MOCK_DATA
    }
    return data
  }, [data])

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Market",
        cell: () => (
          <div className="flex items-center space-x-2">
            <TokenPair
              titleProps={{
                variant: "title3",
                className: "text-sm text-current font-normal",
                as: "span",
              }}
              tokenClasses="w-4 h-4"
              baseToken={market?.base}
              quoteToken={market?.quote}
            />
          </div>
        ),
      }),
      columnHelper.accessor("isBid", {
        header: "Side",
        cell: (row) => {
          const isBid = row.getValue()
          return (
            <div
              className={cn(isBid ? "text-green-caribbean" : "text-red-100")}
            >
              {isBid ? "Buy" : "Sell"}
            </div>
          )
        },
        sortingFn: "datetime",
      }),
      columnHelper.display({
        header: "Type",
        cell: () => <span>Limit</span>,
      }),
      columnHelper.display({
        header: "Filled/Amount",
        cell: ({ row }) => {
          const { initialWants, takerGot, initialGives, isBid, takerGave } =
            row.original
          const baseSymbol = market?.base.symbol
          const quoteSymbol = market?.quote.symbol
          const symbol = isBid ? baseSymbol : quoteSymbol

          const displayDecimals = isBid
            ? market?.base.displayDecimals
            : market?.quote.displayDecimals

          const amount = Big(initialWants).toFixed(displayDecimals)
          const filled = Big(takerGot).toFixed(displayDecimals)
          const progress = Math.min(
            Math.round(
              Big(filled)
                .mul(100)
                .div(Big(amount).eq(0) ? 1 : amount)
                .toNumber(),
            ),
            100,
          )
          return market ? (
            <div className={cn("flex items-center")}>
              <span className="text-sm text-muted-foreground">
                {filled}
                &nbsp;/
              </span>
              <span className="">
                &nbsp;
                {amount} {symbol}
              </span>
              <CircularProgressBar progress={progress} className="ml-3" />
            </div>
          ) : (
            <Skeleton className="w-32 h-6" />
          )
        },
        enableSorting: false,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (row) =>
          market ? (
            row.getValue() ? (
              <span>
                {Big(row.getValue()).toFixed(market.quote.priceDisplayDecimals)}{" "}
                {market.quote.symbol}
              </span>
            ) : (
              <span>-</span>
            )
          ) : (
            <Skeleton className="w-20 h-6" />
          ),
      }),
      columnHelper.accessor("expiryDate", {
        header: "Time in force",
        cell: (row) => {
          const expiry = row.getValue()
          return expiry ? <Timer expiry={expiry} /> : <div>-</div>
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const { expiryDate } = row.original
          const isExpired = expiryDate
            ? new Date(expiryDate) < new Date()
            : true

          return (
            <div className="w-full h-full flex justify-end space-x-1">
              <IconButton
                tooltip="Modify"
                className="aspect-square w-6 rounded-full"
                disabled={isExpired}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(row.original)
                }}
              >
                <Pen />
              </IconButton>
              <IconButton
                tooltip="Cancel offer"
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
    [market, onEdit, onCancel],
  )

  return useReactTable({
    data: tableData,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
