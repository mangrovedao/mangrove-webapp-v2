import React from "react"

import RefillOfferDialog from "@/app/strategies/(shared)/_components/refill-dialog"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useHoveredOfferStore } from "@/stores/hovered-offer.store"
import { OfferParsed } from "@mangrovedao/mgv"
import useKandel from "../../../_providers/kandel-strategy"
import { useOffersTable } from "./use-offers-table"

export default function OffersTable() {
  const [refillOffer, setRefillOffer] = React.useState<
    (OfferParsed & { formattedGives: string }) | undefined
  >()

  const { mergedOffers, strategyQuery, strategyStatusQuery } = useKandel()
  const { hoveredOffer, setHoveredOffer } = useHoveredOfferStore()

  const table = useOffersTable({
    data: mergedOffers,
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
          offer.id === hoveredOffer?.id && offer.ba === hoveredOffer?.ba
        }
        onRowHover={(offer) => setHoveredOffer(offer as OfferParsed)}
        // renderExtraRow={(row) => {
        //   if (row.original.live) return null
        //   return <RefillRow row={row} openRefill={setRefillOffer} />
        // }}
      />
      <RefillOfferDialog
        offer={refillOffer}
        onClose={() => setRefillOffer(undefined)}
      />
    </>
  )
}
