import { DataTable } from "@/components/ui/data-table/data-table"
import { useMemo } from "react"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../../parameters/hook/use-parameters"
import { Parameters, useParametersTable } from "./use-parameters-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery, baseToken, quoteToken } =
    useKandel()

  const { currentParameter, publishedBase, publishedQuote } = useParameters()
  const { creationDate, length, priceRatio } = currentParameter

  const data: Parameters[] = useMemo(
    () => [
      {
        date: creationDate,
        spread: "-",
        pricePoints: length,
        amount: `${publishedBase.toFixed(6)} ${baseToken?.symbol} - ${publishedQuote.toFixed(6)} ${quoteToken?.symbol}`,
        ratio: priceRatio?.toFixed(4),
      },
    ],
    [creationDate, length, publishedBase.toFixed(6), priceRatio],
  )

  const table = useParametersTable({
    data,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
