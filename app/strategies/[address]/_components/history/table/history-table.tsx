import { DataTable } from "@/components/ui/data-table/data-table"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../../parameters/hook/use-parameters"
import { Parameters, useParametersTables } from "./use-parameters-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery } = useKandel()

  const { currentParameter, depositedBase } = useParameters()
  const { creationDate, length, priceRatio, address } = currentParameter

  const table = useParametersTables({
    data: [
      {
        date: creationDate,
        spread: "-",
        pricePoints: length,
        amount: depositedBase,
        ratio: priceRatio?.toFixed(4),
        txHash: address,
      },
    ] as Parameters[],
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
