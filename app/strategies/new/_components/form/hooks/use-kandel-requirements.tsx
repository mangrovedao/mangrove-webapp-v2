"use client"
import { useQuery } from "@tanstack/react-query"
import { BigSource } from "big.js"

import useKandel from "@/providers/kandel-strategies"
import useMarket from "@/providers/market"

type Params = {
  onAave?: boolean
  stepSize?: number | string
  minPrice?: BigSource
  maxPrice?: BigSource
  baseDeposit?: string
  quoteDeposit?: string
}

export function useKandelRequirements({
  onAave = false,
  minPrice,
  maxPrice,
  stepSize,
  baseDeposit,
  quoteDeposit,
}: Params) {
  const { market, midPrice } = useMarket()
  const { kandelStrategies, generator, config } = useKandel()
  return useQuery({
    queryKey: [
      "kandel-requirements",
      minPrice,
      maxPrice,
      baseDeposit,
      quoteDeposit,
      midPrice,
      stepSize,
      onAave,
      market?.base.id,
      market?.quote?.id,
    ],
    queryFn: async () => {
      if (
        !(
          kandelStrategies &&
          generator &&
          market &&
          midPrice &&
          config &&
          minPrice &&
          maxPrice
        )
      )
        return null

      try {
        const minimumBasePerOffer =
          await kandelStrategies.seeder.getMinimumVolume({
            market,
            offerType: "asks",
            onAave,
          })

        const minimumQuotePerOffer =
          await kandelStrategies.seeder.getMinimumVolume({
            market,
            offerType: "bids",
            onAave,
          })

        // Calculate a candidate distribution with the recommended minimum volumes given the price range.
        const minimumDistribution =
          await generator.calculateMinimumDistribution({
            minimumBasePerOffer,
            minimumQuotePerOffer,
            distributionParams: {
              generateFromMid: true,
              minPrice,
              maxPrice,
              stepSize: Number(stepSize) || config.stepSize,
              midPrice,
              pricePoints: 2,
            },
          })

        // requiredBase / quote => minimum to use in the fields
        const { requiredBase, requiredQuote } =
          minimumDistribution.getOfferedVolumeForDistribution()

        const availableBase = baseDeposit || requiredBase
        const availableQuote = quoteDeposit || requiredQuote

        const distribution =
          await generator.recalculateDistributionFromAvailable({
            distribution: minimumDistribution,
            availableBase,
            availableQuote,
          })

        // minimum allowed value for gas (or bounty)
        const requiredBounty =
          await kandelStrategies.seeder.getRequiredProvision(
            {
              onAave,
              market,
              liquiditySharing: false,
            },
            distribution,
          )

        return {
          requiredBase,
          requiredQuote,
          requiredBounty,
          distribution,
        }
      } catch (e) {
        console.error(e)
        return null
      }
    },
    enabled: !!(kandelStrategies && generator && market && midPrice),
  })
}
