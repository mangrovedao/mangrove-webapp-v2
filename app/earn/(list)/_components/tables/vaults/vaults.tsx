"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import useMarket from "@/providers/market"
import type { Strategy } from "../../../_schemas/kandels"
import { Vault } from "../../../_schemas/vaults"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

type Props = {
  type: "user" | "all"
}
export function Vaults({ type }: Props) {
  const { push } = useRouter()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket: market } = useMarket()

  const { data, isLoading, error, refetch } = useVaults({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const { data: count } = useVaults({
    select: (strategies) => strategies.length,
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [])

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    type,
    pageSize,
    data: [
      {
        address: "0xbC766847aB3b36F7012037f11Cd05B187F51Fc23",
        kandel: "0x2341561eaC01D79e184eaCF09f380EB8A0e3408b",
        market: {
          base: {
            address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            symbol: "WETH",
            decimals: 18,
            displayDecimals: 3,
            priceDisplayDecimals: 4,
            mgvTestToken: false,
          },
          quote: {
            address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            symbol: "USDC",
            decimals: 18,
            displayDecimals: 2,
            priceDisplayDecimals: 4,
            mgvTestToken: false,
          },
          tickSpacing: "1" as unknown as bigint,
        },
        strategist: "SKATEFI",
        fees: 0.01,
        totalBase: "20280219438420489" as unknown as bigint,
        totalQuote: "70870059437845227129" as unknown as bigint,
        balanceBase: "0" as unknown as bigint,
        balanceQuote: "0" as unknown as bigint,
        pnl: 0,
        baseIsToken0: false,
      },
    ],
    onDeposit: (vault: Vault) => undefined,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!error}
        isLoading={isLoading || !market}
        onRowClick={
          (vault) => {
            if (vault) {
              push(`/earn/${vault.address}`)
            }
          }
          // note: lost of context after redirecting with push method here
          // push(`/strategies/${strategy?.address}`)
          // (window.location.href = `/strategies/${strategy?.address}`)
        }
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count,
        }}
      />
      <CloseStrategyDialog
        strategyAddress={closeStrategy?.address || ""}
        isOpen={!!closeStrategy}
        onClose={() => setCloseStrategy(undefined)}
      />
    </>
  )
}
