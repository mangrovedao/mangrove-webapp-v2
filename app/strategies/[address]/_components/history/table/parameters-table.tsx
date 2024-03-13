import { DataTable } from "@/components/ui/data-table/data-table"
import { useMemo } from "react"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../../parameters/hook/use-parameters"
import { Parameters, useParametersTable } from "./use-parameters-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery } = useKandel()

  const { currentParameter, depositedBase } = useParameters()
  const { creationDate, length, priceRatio } = currentParameter

  const data: Parameters[] = useMemo(
    () => [
      {
        date: creationDate,
        spread: "-",
        pricePoints: length,
        amount: depositedBase,
        ratio: priceRatio?.toFixed(4),
      },
    ],
    [creationDate, length, depositedBase, priceRatio],
  )

  const table = useParametersTable({
    data,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
