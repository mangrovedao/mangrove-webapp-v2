import { DataTable } from "@/components/ui/data-table/data-table"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../../parameters/hook/use-parameters"
import { useHistoryParams } from "./use-history-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery } = useKandel()

  const { depositsAndWithdraws } = useParameters()

  const table = useHistoryParams({
    data: depositsAndWithdraws,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
