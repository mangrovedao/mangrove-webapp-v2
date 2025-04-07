"use client"

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import React from "react"
import { formatUnits } from "viem"

import { Vault } from "@/app/earn/(shared)/types"
import { getChainImage } from "@/app/earn/(shared)/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { formatNumber } from "@/utils/numbers"
import { Market } from "../components/market"
import { Value } from "../components/value"
const columnHelper = createColumnHelper<Vault>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  data?: Vault[]
  pageSize: number
  onManage: (vault: Vault) => void
  isLoading: boolean
}

export function useTable({ pageSize, data, onManage, isLoading }: Params) {

  const { defaultChain } = useDefaultChain()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "blockchain-explorer",
        header: () => "",
        cell: ({ row }) => {
          const { address } = row.original
          const blockExplorerUrl = defaultChain?.blockExplorers?.default.url

          // note: check if we can retrive logos from library directly
          // const icon = getWhitelistedChainObjects().find(
          //   (item) => item.id === chain.id,
          // )

          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity bg-bg-tertiary size-6 rounded-sm flex items-center justify-center"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getChainImage(defaultChain)}
              </Link>
            </div>
          )
        },
      }),

      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          const { market } = row.original

          return (
            <Market
              tokenPairClasses="text-sm"
              base={market.base.address}
              quote={market.quote.address}
            />
          )
        },
      }),

      columnHelper.display({
        header: "Strategy",
        cell: ({ row }) => {
          const { type } = row.original
          const isTrusted = true
          return <Value value={type} trusted={isTrusted} />
        },
      }),

      columnHelper.display({
        id: "Deposited",
        header: () => (
          <span className="text-right w-full block">Deposited</span>
        ),
        cell: ({ row }) => {
          if (isLoading) {
            return (
              <div className="text-right w-full">
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
            )
          }

          const {
            userBaseBalance,
            userQuoteBalance,
            market,
            baseDollarPrice,
            quoteDollarPrice,
          } = row.original

          const value =
            Number(formatUnits(userBaseBalance, market.base.decimals)) *
              baseDollarPrice +
            Number(formatUnits(userQuoteBalance, market.quote.decimals)) *
              quoteDollarPrice

          return (
            <div className="text-right w-full">
              <Value
                value={formatNumber(Number(value.toFixed(2)))}
                symbol={"$"}
              />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "Curator",
        header: () => <span className="text-right w-full block">Curator</span>,
        cell: ({ row }) => {
          const { strategist } = row.original
          return (
            <div className="text-right w-full">
              <Value value={strategist} className="justify-end" />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "My APY",
        header: () => <span className="text-right w-full block">APR</span>,
        cell: ({ row }) => {

          if (isLoading) {
            return (
              <div className="text-right w-full">
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
            )
          }

          const { apr } = row.original
          return (
            <div className="text-right w-full">
              <Value value={`${apr.toFixed(2)}%`} className="justify-end" />
            </div>
          )
        },
      }),

      // columnHelper.accessor("tvl", {
      //   header: () => <div className="text-right">TVL</div>,
      //   cell: ({ row }) => {
      //     const { tvl, market, quoteDollarPrice } = row.original

      //     const formattedTvl =
      //       Number(formatUnits(tvl, market.quote.decimals)) * quoteDollarPrice

      //     return (
      //       <div className="w-full h-full flex justify-end">
      //         <Value
      //           value={formatNumber(Number(formattedTvl.toFixed(2)))}
      //           symbol={"$"}
      //         />
      //       </div>
      //     )
      //   },
      // }),
    ],
    [onManage],
  )

  return useReactTable({
    data: data ?? DEFAULT_DATA,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
}
