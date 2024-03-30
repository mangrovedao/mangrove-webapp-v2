import { useMemo } from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../../parameters/hook/use-parameters"
import { Parameters, useParametersTable } from "./use-parameters-table"

export default function HistoryTable() {
  const { strategyQuery, strategyStatusQuery, baseToken, quoteToken } =
    useKandel()

  const { currentParameter, publishedBase, publishedQuote } = useParameters()
  const { creationDate, length, stepSize, lockedBounty, nativeSymbol } =
    currentParameter

  const data: Parameters[] = useMemo(
    () => [
      {
        priceRange:
          currentParameter.minPrice && currentParameter.maxPrice && quoteToken
            ? [
                `${currentParameter.minPrice?.toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`,
                `${currentParameter.maxPrice?.toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`,
              ]
            : undefined,
        date: creationDate,
        pricePoints: length,
        stepSize,
        amount:
          publishedBase && publishedQuote && baseToken && quoteToken
            ? [
                `${publishedBase.toFixed(6)} ${baseToken?.symbol}`,
                `${publishedQuote.toFixed(6)} ${quoteToken?.symbol}`,
              ]
            : undefined,
        lockedBounty: `${Number(lockedBounty || "0").toFixed(6)} ${nativeSymbol}`,
      },
    ],
    [creationDate, length, publishedBase.toFixed(6)],
  )

  const table = useParametersTable({
    data,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
