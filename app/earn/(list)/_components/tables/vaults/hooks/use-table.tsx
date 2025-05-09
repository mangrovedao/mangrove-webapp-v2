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

import { useMgvFdv } from "@/app/earn/(shared)/store/vault-store"
import { Vault } from "@/app/earn/(shared)/types"
import { getChainImage } from "@/app/earn/(shared)/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { Check } from "@/svgs"
import { formatNumber } from "@/utils/numbers"
import { Market } from "../components/market"
import { Value } from "../components/value"

const columnHelper = createColumnHelper<Vault>()

type Params = {
  data?: Vault[]
  pageSize: number
  onDeposit: (vault: Vault) => void
  isLoading: boolean
  defaultData: Vault[]
}

export function useTable({
  pageSize,
  data,
  onDeposit,
  isLoading,
  defaultData,
}: Params) {
  const { defaultChain } = useDefaultChain()
  const { chain } = useAccount()
  const { fdv, setFdv } = useMgvFdv()

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
          const { deprecated } = row.original
          return (
            <Value
              value={`${row.original.type} ${deprecated ? "(Deprecated)" : ""}`}
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
              <div className="text-right w-full">
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
            )
          }
          const { tvl, market, deprecated } = row.original

          if (deprecated)
            return <div className="text-right w-full flex-end">-</div>

          return (
            <div className="text-right w-full">
              <Value value={Number(tvl).toFixed(2)} symbol={"$"} />
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
              <Value value={row.original.strategist} className="justify-end" />
            </div>
          )
        },
      }),

      columnHelper.display({
        id: "APR",
        header: () => <span className="text-right w-full block">APR</span>,
        cell: ({ row }) => {
          if (isLoading) {
            return (
              <div className="text-right w-full">
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
            )
          }

          const { apr: _apr, deprecated } = row.original

          if (deprecated)
            return <div className="text-right w-full flex-end">-</div>

          const apr = _apr ? `${_apr.toFixed(2)}%` : "-"

          const incentivesApr = row.original.incentivesApr
            ? `${row.original.incentivesApr.toFixed(2)}%`
            : "-"

          return (
            <div className="group relative w-full text-right">
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger className="hover:opacity-80 transition-opacity">
                    <Value value={apr} className="justify-end" />
                  </TooltipTrigger>
                  <TooltipContent
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="p-4 bg-bg-secondary border border-border-primary"
                  >
                    <div className="cursor-default">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-text-secondary">
                            Incentives rate
                          </span>
                          <span className="text-sm text-text-primary">
                            {incentivesApr}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-text-secondary">
                            Net APR
                          </span>
                          <span className="text-sm text-text-primary">
                            {apr}
                          </span>
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="flex flex-col">
                        <Label className="text-sm text-text-secondary">
                          Update FDV (Fully Diluted Valuation)
                        </Label>

                        <div className="flex gap-2 items-center">
                          <form
                            className="flex gap-2 items-center"
                            onSubmit={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const value = (e.target as HTMLFormElement)
                                .elements[0] as HTMLInputElement
                              setFdv(Number(value.value))
                            }}
                          >
                            <Input
                              placeholder={formatNumber(fdv)}
                              className="w-full bg-bg-tertiary h-8 p-2"
                            />
                            <Button
                              type="submit"
                              size={"only"}
                              className="size-6"
                            >
                              <Check className="size-6" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
      }),
    ],
    [onDeposit],
  )

  return useReactTable({
    data: data ?? defaultData,
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
