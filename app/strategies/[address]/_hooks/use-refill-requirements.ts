"use client"

import { OfferParsed } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import useKandel from "../_providers/kandel-strategy"

type Params = {
  offer: OfferParsed
}

export function useRefillRequirements({ offer }: Params) {
  const { strategyStatusQuery } = useKandel()
  const { kandelInstance, market } = strategyStatusQuery.data ?? {}
  return useQuery({
    queryKey: ["refill-requirements", offer.id, offer.ba],
    queryFn: async () => {
      if (!(kandelInstance && market)) return null
      // note: to re-implement
      // const minimumVolume = await kandelInstance.getMinimumVolumeForIndex({
      //   offerType: offer.offerType,
      //   index: offer.index,
      //   tick: offer.tick,
      // })
      // return {
      //   minimumVolume,
      // }
    },
    meta: {
      error: "Unable to fetch re-fill requirements",
    },
    enabled: !!(kandelInstance && market && offer.id && offer.ba),
    retry: false,
  })
}
