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

import { Vault } from "@/app/earn/(shared)/_hooks/use-vault-whitelist"
import { useCurrentVaultsInfos } from "@/app/earn/(shared)/_hooks/use-vault.info"
import { AnimatedSkeleton } from "@/app/earn/(shared)/components/animated-skeleton"
import { getChainImage } from "@/app/earn/(shared)/utils"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getExactWeiAmount } from "@/utils/regexp"
import { formatUnits } from "viem"
import { Apr } from "../../../../../(shared)/components/apr"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()

type Params = {
  data?: Vault[]
  pageSize: number
  onDeposit: (vault: Vault) => void
  isLoading: boolean
}

export function useTable({ pageSize, data, onDeposit, isLoading }: Params) {
  const { defaultChain } = useDefaultChain()
  const { chain } = useAccount()

  const { data: vaultsInfos } = useCurrentVaultsInfos()

  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "blockchain-explorer",

        header: () => "",
        cell: ({ row }) => {
          const { address } = row.original
          const blockExplorerUrl = chain?.blockExplorers?.default.url

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
          return (
            <Market
              base={row.original.market.base.address}
              quote={row.original.market.quote.address}
            />
          )
        },
      }),

      columnHelper.display({
        enableResizing: false,
        header: "Strategy",
        cell: ({ row }) => {
          const isTrusted = true
          const { isDeprecated } = row.original

          return (
            <Value
              value={`${row.original.strategyType} ${isDeprecated ? "(Deprecated)" : ""}`}
              trusted={isTrusted}
            />
          )
        },
      }),

      columnHelper.display({
        id: "TVL",
        header: () => <span className="text-right w-full block">TVL</span>,
        cell: ({ row }) => {
          if (isLoading) {
            return (
              <div className="flex justify-end w-full">
                <AnimatedSkeleton className="h-6 w-24" />
              </div>
            )
          }

          const { isDeprecated, market, incentives } = row.original

          const tvl =
            vaultsInfos?.find((vault) => vault.vault === row.original.address)
              ?.TVL || 0n

          if (isDeprecated)
            return <div className="flex justify-end w-full">-</div>

          return (
            <div className="flex justify-end w-full">
              <Value
                value={getExactWeiAmount(
                  formatUnits(tvl || 0n, market.quote.decimals || 18),
                  market.quote.displayDecimals || 4,
                )}
                symbol={` ${market.quote.symbol}`}
              />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "Manager",
        header: () => <span className="text-right w-full block">Manager</span>,
        cell: ({ row }) => {
          return (
            <div className="text-right w-full">
              <Value value={row.original.manager} className="justify-end" />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "APR",
        header: () => <span className="text-right w-full block">APR</span>,
        cell: ({ row }) => {
          const { isDeprecated } = row.original

          return (
            <Apr
              isLoading={isLoading}
              isDeprecated={isDeprecated}
              kandelAddress={
                vaultsInfos?.find(
                  (vault) => vault.vault === row.original.address,
                )?.kandel
              }
              vault={row.original}
            />
          )
        },
      }),
    ],
    [onDeposit],
  )

  return useReactTable({
    data: data ?? [],
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
