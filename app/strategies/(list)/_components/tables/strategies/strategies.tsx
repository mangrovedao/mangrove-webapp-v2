"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import type { Strategy } from "../../../_schemas/kandels"
import { useStrategies } from "./hooks/use-strategies"
import { useTable } from "./hooks/use-table"

type Props = {
  type: "user" | "all"
}
export function Strategies({ type }: Props) {
  const { push } = useRouter()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { market } = useMarket()
  const { data } = useStrategies()
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
    data,
    onManage: (strategy: Strategy) => {
      push(`/strategies/${strategy.address}`)
    },
    onCancel: (strategy: Strategy) => setCloseStrategy(strategy), // TODO: implement cancel dialog
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!strategiesQuery.error}
        isLoading={strategiesQuery.isLoading || !market}
        onRowClick={(strategy) =>
          // note: lost of context after redirecting with push method here
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
