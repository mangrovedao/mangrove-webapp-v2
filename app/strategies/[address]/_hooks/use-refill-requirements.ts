"use client"

import { useQuery } from "@tanstack/react-query"
import useKandel from "../_providers/kandel-strategy"
import { MergedOffer } from "../_utils/inventory"

type Params = {
  offer: MergedOffer
}

export function useRefillRequirements({ offer }: Params) {
  const { strategyStatusQuery } = useKandel()
  const { stratInstance, market } = strategyStatusQuery.data ?? {}
  return useQuery({
    queryKey: ["refill-requirements", offer.offerId, offer.offerType],
    queryFn: async () => {
      if (!(stratInstance && market)) return null
      const minimumVolume = await stratInstance.getMinimumVolumeForIndex({
        offerType: offer.offerType,
        index: offer.index,
        tick: offer.tick,
      })
      return {
        minimumVolume,
      }
    },
    meta: {
      error: "Unable to fetch re-fill requirements",
    },
    enabled: !!(stratInstance && market && offer.offerId && offer.offerType),
    retry: false,
  })
}
