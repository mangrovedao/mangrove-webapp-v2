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
import { TokenIcon } from "@/components/token-icon"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Close, Pen } from "@/svgs"
import type { AmplifiedOrder } from "../schema"

const columnHelper = createColumnHelper<AmplifiedOrder>()
const DEFAULT_DATA: AmplifiedOrder[] = []

type Params = {
  data?: AmplifiedOrder[]
  onCancel: (order: AmplifiedOrder) => void
  onEdit: (order: AmplifiedOrder) => void
}

export function useAmplifiedTable({ data, onCancel, onEdit }: Params) {
  const { market } = useMarket()
  const { marketsInfoQuery, mangrove } = useMangrove()
  const { data: openMarkets } = marketsInfoQuery

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { offers } = row.original
          const tokens = offers.map((offer) => {
            return offer.market.inbound_tkn
          })

          const symbols = openMarkets?.reduce((acc, market) => {
            const { base, quote } = market
            if (
              tokens.includes(base.address) &&
              base.symbol &&
              !acc.includes(base.symbol)
            ) {
              acc.push(base.symbol)
            }
            if (
              tokens.includes(quote.address) &&
              quote.symbol &&
              !acc.includes(quote.symbol)
            ) {
              acc.push(quote.symbol)
            }
            return acc
          }, [] as string[])

          const notSupportedMarketCount = offers.filter(
            (offer) => !offer.isMarketFound,
          ).length

          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {symbols?.map((symbol) =>
                    symbol ? (
                      <TokenIcon symbol={symbol} />
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-dark-green">
                        ?
                      </div>
                    ),
                  )}
                </div>
                <Text>Multiple</Text>
              </div>
              {notSupportedMarketCount > 1 ? (
                <Caption>Market(s) not supported</Caption>
              ) : (
                <Caption>Market not supported</Caption>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        header: "Side",
        cell: (row) => <div className={"text-green-caribbean"}>Buy</div>,
      }),
      columnHelper.display({
        header: "Type",
        cell: () => <span>Amplified</span>,
      }),
      columnHelper.display({
        header: "Filled/Amount",
        cell: ({ row }) => (
          <div className={"flex items-center"}>
            -
            <CircularProgressBar progress={0} className="ml-3" />
          </div>
        ),
      }),
      columnHelper.display({
        header: "Price",
        cell: ({ row }) => {
          const { offers } = row.original

          const okok = market ? (
            offers[0]?.price ? (
              <span>
                {Big(offers[0].price).toFixed(
                  market.quote.displayedAsPriceDecimals,
                )}{" "}
                {market.quote.symbol}
              </span>
            ) : (
              <span>-</span>
            )
          ) : (
            <Skeleton className="w-20 h-6" />
          )

          return okok
        },
      }),
      columnHelper.accessor("creationDate", {
        header: "Time in force",
        cell: (row) => {
          const expiry = row.getValue()

          // return expiry ? <Timer expiry={new Date(expiry)} /> : <div>-</div>
          return <div>-</div>
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const { offers } = row.original
          const isExpired = 0 // TODO: add expiry date in indexer
            ? new Date(0) < new Date()
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
                tooltip="Retract offer"
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
    data: data ?? DEFAULT_DATA,
    columns,
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
