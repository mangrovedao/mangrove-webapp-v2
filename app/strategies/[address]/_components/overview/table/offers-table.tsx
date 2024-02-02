import { DataTable } from "@/components/ui/data-table/data-table"
import useKandel from "../../../_providers/kandel-strategy"
import { type MergedOffers } from "../../../_utils/inventory"
import { useOffersTable } from "./use-offers-table"

export default function OffersTable() {
  const { mergedOffers, strategyQuery, strategyStatusQuery } = useKandel()

  const table = useOffersTable({
    data: mergedOffers as MergedOffers,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return <DataTable table={table} isLoading={isLoading} isError={isError} />
}
