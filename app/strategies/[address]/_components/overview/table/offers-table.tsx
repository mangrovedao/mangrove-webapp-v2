import React from "react"

import RefillOfferDialog from "@/app/strategies/(shared)/_components/refill-dialog"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useHoveredOfferStore } from "@/stores/hovered-offer.store"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffer, type MergedOffers } from "../../../_utils/inventory"
import RefillRow from "./refill-row"
import { useOffersTable } from "./use-offers-table"

export default function OffersTable() {
  const [refillOffer, setRefillOffer] = React.useState<
    MergedOffer | undefined
  >()

  const { mergedOffers, strategyQuery, strategyStatusQuery } = useKandel()
  const { hoveredOffer, setHoveredOffer } = useHoveredOfferStore()

  const table = useOffersTable({
    data: mergedOffers as MergedOffers,
  })

  const isLoading = strategyQuery.isLoading || strategyStatusQuery.isLoading
  const isError = strategyQuery.isError || strategyStatusQuery.isError

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        isError={isError}
        isRowHighlighted={(offer) =>
          offer.offerId === hoveredOffer?.offerId &&
          offer.offerType === hoveredOffer?.offerType
        }
        onRowHover={(offer) => setHoveredOffer(offer as MergedOffer)}
        renderExtraRow={(row) => {
          if (row.original.live) return null
          return <RefillRow row={row} openRefill={setRefillOffer} />
        }}
      />
      <RefillOfferDialog
        offer={refillOffer}
        onClose={() => setRefillOffer(undefined)}
      />
    </>
  )
}
