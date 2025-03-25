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

import { Vault } from "@/app/earn/(shared)/types"
import { getChainImage } from "@/app/earn/(shared)/utils"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { formatNumber } from "@/utils/numbers"
import { formatUnits } from "viem"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  data?: Vault[]
  pageSize: number
  onManage: (vault: Vault) => void
}

export function useTable({ pageSize, data, onManage }: Params) {
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
                className="hover:opacity-80 transition-opacity bg-[#284061] size-6 rounded-sm flex items-center justify-center"
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
        header: () => <span>Deposited</span>,
        cell: ({ row }) => {
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
            <div>
              <Value
                value={formatNumber(Number(value.toFixed(2)))}
                symbol={"$"}
              />
            </div>
          )
        },
      }),

      columnHelper.display({
        header: "Curator",
        cell: ({ row }) => {
          const { strategist } = row.original
          return <Value value={strategist} />
        },
      }),

      columnHelper.display({
        id: "My APY",
        header: () => <span>APR</span>,
        cell: ({ row }) => {
          const { apr } = row.original
          return (
            <div>
              <Value value={`${apr.toFixed(2)}%`} />
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
