"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"

import { IconButton } from "@/components/icon-button"
import { TokenIcon } from "@/components/token-icon"
import { Text } from "@/components/typography/text"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import useMarket from "@/providers/market"
import { Close, Pen } from "@/svgs"
import { Address } from "viem"
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

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { offers } = row.original

          const tokens = offers.map((offer) => {
            return useTokenFromAddress(offer.market.inbound_tkn as Address).data
          })

          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {tokens?.map((token) =>
                    token ? (
                      <TokenIcon symbol={token.symbol} />
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-dark-green">
                        ?
                      </div>
                    ),
                  )}
                </div>
                <Text>Multiple</Text>
              </div>
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
          return <span>-</span>
        },
      }),
      // TODO: add expiry date in indexer
      columnHelper.accessor("offers.isOpen", {
        header: "Status",
        cell: ({ row }) => {
          const { offers } = row.original
          const isOpen = offers.some((offer) => offer.isOpen)
          return isOpen ? (
            <div className="text-green-caribbean">Open</div>
          ) : (
            <div className="text-red-100">Closed</div>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const { offers } = row.original
          const isClosed = offers.some((offer) => !offer.isOpen)
          // const isExpired = 0 // TODO: add expiry date in indexer
          //   ? new Date(0) < new Date()
          //   : true

          return (
            <div className="w-full h-full flex justify-end space-x-1">
              <IconButton
                tooltip="Modify"
                className="aspect-square w-6 rounded-full"
                disabled={isClosed}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(row.original)
                }}
              >
                <Pen />
              </IconButton>
              <IconButton
                disabled={isClosed}
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
