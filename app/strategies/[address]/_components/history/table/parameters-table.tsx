"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useStrategyHistory } from "../../../_hooks/use-strategy-history"
import useKandel from "../../../_providers/kandel-strategy"
import { useParametersTable } from "./use-parameters-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery } = useKandel()

  const { data: strategyHistory } = useStrategyHistory({
    kandelAddress: strategyQuery.data?.address,
  })

  const table = useParametersTable({
    data: strategyHistory,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
  // return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
