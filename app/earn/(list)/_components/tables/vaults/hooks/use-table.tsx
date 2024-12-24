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
import { useAccount } from "wagmi"

import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { getChainImage } from "@/app/earn/(shared)/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/utils/numbers"
import { formatUnits } from "viem"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault | VaultWhitelist>()
const DEFAULT_DATA: Vault[] = []

type Params = {
  data?: Vault[]
  pageSize: number
  onDeposit: (vault: Vault) => void
}

export function useTable({ pageSize, data, onDeposit }: Params) {
  const { chain } = useAccount()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "blockchain-explorer",
        header: () => "",
        cell: ({ row }) => {
          const { address } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url

          // note: check if we can retrive logos from library directly
          // const icon = getWhitelistedChainObjects().find(
          //   (item) => item.id === chain.id,
          // )

          return (
            <div className="flex flex-col underline">
              <Link
                className="hover:opacity-80 transition-opacity bg-[#284061] size-6 rounded-md flex items-center justify-center"
                href={`${blockExplorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getChainImage(chain?.id, chain?.name)}
              </Link>
            </div>
          )
        },
      }),

      columnHelper.display({
        header: "Market",
        cell: ({ row }) => {
          return (
            <Market
              base={row.original.market.base.address}
              quote={row.original.market.quote.address}
              tokenPairClasses="font-bold text-lg"
            />
          )
        },
      }),

      columnHelper.display({
        header: "Strategy",
        cell: ({ row }) => {
          const type =
            "type" in row.original
              ? row.original.type
              : row.original.strategyType
          const isTrusted = true

          return <Value value={type} trusted={isTrusted} />
        },
      }),

      columnHelper.display({
        header: "Manager",
        cell: ({ row }) => {
          const strategist =
            "strategist" in row.original
              ? row.original.strategist
              : row.original.manager
          return <Value value={strategist} />
        },
      }),

      columnHelper.display({
        id: "APR",
        header: () => <div className="text-right">APR</div>,
        cell: ({ row }) => {
          const apr =
            "apr" in row.original
              ? row.original.apr
                ? `${row.original.apr.toFixed(2)}%`
                : "-"
              : "-"

          const incentivesApr =
            "incentivesApr" in row.original
              ? row.original.incentivesApr
                ? `${row.original.incentivesApr.toFixed(2)}%`
                : "-"
              : "-"

          return (
            <div className="w-full h-full flex justify-end group relative">
              <Value value={apr} />
              <div className="absolute -top-8 left-20 border border-border-secondary bg-bg-secondary backdrop-blur-sm rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">
                      Incentives rate
                    </span>
                    <span className="text-sm text-text-primary">
                      {incentivesApr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Net APR</span>
                    <span className="text-sm text-text-primary">{apr}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        },
      }),

      // note: not implemented yet
      // columnHelper.display({
      //   id: "30 D",
      //   header: () => <div className="text-right">30 D</div>,
      //   cell: ({ row }) => {
      //     const value = "-"
      //     return (
      //       <div className="w-full h-full flex justify-end">
      //         <Value value={value} />
      //       </div>
      //     )
      //   },
      // }),

      columnHelper.display({
        id: "TVL",
        header: () => <div className="text-right">TVL</div>,
        cell: ({ row }) => {
          const loading = !("tvl" in row.original)
          const tvl = "tvl" in row.original ? row.original.tvl : 0n
          const market = row.original.market
          const quoteDollarPrice =
            "quoteDollarPrice" in row.original
              ? row.original.quoteDollarPrice
              : 1

          const value =
            Number(formatUnits(tvl || 0n, market.quote.decimals || 18)) *
            quoteDollarPrice
          return (
            <div className="w-full h-full flex justify-end">
              {loading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <Value
                  value={formatNumber(Number(value.toFixed(2)))}
                  symbol={"$"}
                />
              )}
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => "",
        cell: ({ row }) => {
          return (
            <div className="w-full h-full flex justify-end space-x-1 items-center">
              <Button
                className="text-text-tertiary text-lg"
                variant={"invisible"}
              >
                Deposit
              </Button>
            </div>
          )
        },
      }),
    ],
    [onDeposit],
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
