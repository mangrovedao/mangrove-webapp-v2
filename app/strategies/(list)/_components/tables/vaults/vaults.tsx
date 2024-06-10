"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table/data-table"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import type { Strategy } from "../../../_schemas/kandels"
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
  const { marketsInfoQuery } = useMangrove()
  const { data: openMarkets } = marketsInfoQuery
  const { data: count } = useVaults({
    select: (strategies) => strategies.length,
  })
  const vaultsQuery = useVaults({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    type,
    data: vaultsQuery.data,
    onManage: (strategy: Strategy) => {
      const baseToken = openMarkets?.find(
        (item) =>
          item.base.address.toLowerCase() === strategy.base.toLowerCase(),
      )?.base
      const quoteToken = openMarkets?.find(
        (item) =>
          item.quote.address.toLowerCase() === strategy.quote.toLowerCase(),
      )?.quote

      push(
        `/strategies/${strategy.address}/edit?market=${baseToken?.id},${quoteToken?.id}`,
      )
    },
    onCancel: (strategy: Strategy) => setCloseStrategy(strategy),
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!vaultsQuery.error}
        isLoading={vaultsQuery.isLoading || !market}
        onRowClick={(strategy) =>
          // note: lost of context after redirecting with push method here
          // push(`/strategies/${strategy?.address}`)
          (window.location.href = `/strategies/${strategy?.address}`)
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
