"use client"
import { useQuery } from "@tanstack/react-query"
import { BigSource } from "big.js"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { ChangingFrom } from "../_stores/new-strat.store"

export type Params = {
  onAave?: boolean
  stepSize: number | string
  minPrice: BigSource
  maxPrice: BigSource
  pricePoints: number | string
  ratio?: number | string
  isChangingFrom?: ChangingFrom
}

export function useKandelRequirements({
  onAave = false,
  minPrice,
  maxPrice,
  stepSize,
  pricePoints,
  ratio,
  isChangingFrom,
}: Params) {
  const { market, midPrice } = useMarket()
  const { kandelStrategies, generator, config } = useKandel()
  return useQuery({
    queryKey: [
      "kandel-requirements",
      minPrice,
      maxPrice,
      midPrice,
      stepSize,
      pricePoints,
      onAave,
      market?.base.id,
      market?.quote?.id,
      ratio,
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

        const param: Parameters<
          typeof generator.calculateMinimumDistribution
        >[number] = {
          minimumBasePerOffer,
          minimumQuotePerOffer,
          distributionParams: {
            generateFromMid: false,
            minPrice,
            maxPrice,
            stepSize: Number(stepSize) ?? config.stepSize,
            midPrice,
            pricePoints:
              isChangingFrom !== "ratio" ? Number(pricePoints) : undefined,
            priceRatio: isChangingFrom === "ratio" ? Number(ratio) : undefined,
          },
        }

        // Calculate a candidate distribution with the recommended minimum volumes given the price range.
        const minimumDistribution =
          await generator.calculateMinimumDistribution(param)

        // requiredBase / quote => minimum to use in the fields
        const { requiredBase, requiredQuote } =
          minimumDistribution.getOfferedVolumeForDistribution()

        const availableBase = requiredBase
        const availableQuote = requiredQuote

        const distribution =
          await generator.recalculateDistributionFromAvailable({
            distribution: minimumDistribution,
            availableBase,
            availableQuote,
          })

        const offers = distribution.getOffersWithPrices()
        const offersWithPrices = {
          asks: offers.asks.filter((offer) => offer.gives.gt(0)),
          bids: offers.bids.filter((offer) => offer.gives.gt(0)),
        }

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
          offersWithPrices,
          priceRatio: minimumDistribution.getPriceRatio(),
          pricePoints: minimumDistribution.pricePoints,
        }
      } catch (e) {
        const message = getErrorMessage(e)
        if (message.includes("revert")) {
          throw new Error(`Error: one of the parameters is invalid`)
        }
        throw message
      }
    },
    enabled: !!(kandelStrategies && generator && market && midPrice),
  })
}
