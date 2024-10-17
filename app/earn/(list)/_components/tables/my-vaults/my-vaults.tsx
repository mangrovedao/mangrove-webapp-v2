"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import useMarket from "@/providers/market"
import type { Strategy } from "../../../_schemas/kandels"
import { useStrategies } from "./hooks/use-strategies"
import { useTable } from "./hooks/use-table"

type Props = {
  type: "user" | "all"
}
export function MyVaults({ type }: Props) {
  const { push } = useRouter()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const { currentMarket: market, markets } = useMarket()
  const { data: count } = useStrategies({
    select: (strategies) => strategies.length,
  })

  const strategiesQuery = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    type,
    pageSize,
    data: strategiesQuery.data,
    onManage: (strategy: Strategy) => {
      const baseToken = markets?.find(
        (item) =>
          item.base.address.toLowerCase() === strategy.base.toLowerCase(),
      )?.base
      const quoteToken = markets?.find(
        (item) =>
          item.quote.address.toLowerCase() === strategy.quote.toLowerCase(),
      )?.quote

      push(
        `/strategies/${strategy.address}/edit?market=${baseToken?.address},${quoteToken?.address},1`,
      )
    },
    onCancel: (strategy: Strategy) => setCloseStrategy(strategy),
  })

  return (
    <>
      <DataTable
        table={table}
        emptyArrayMessage="No positions yet."
        isError={!!strategiesQuery.error}
        isLoading={strategiesQuery.isLoading || !market}
        // onRowClick={(earn) =>
        //   // note: lost of context after redirecting with push method here
        //   // push(`/earn/${strategy?.address}`)
        //   (window.location.href = `/earn/${strategy?.address}`)
        // }
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
