"use client"
import { useQuery } from "@tanstack/react-query"
import { BigSource } from "big.js"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { useBook } from "@/hooks/use-book"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { ChangingFrom } from "../_stores/new-strat.store"

export type Params = {
  stepSize: number | string
  minPrice: BigSource
  maxPrice: BigSource
  availableBase?: BigSource
  availableQuote?: BigSource
  numberOfOffers: number | string
  isChangingFrom?: ChangingFrom
}

export function useKandelRequirements({
  minPrice,
  maxPrice,
  availableBase,
  availableQuote,
  stepSize,
  numberOfOffers,
}: Params) {
  const { currentMarket: market } = useMarket()
  const { book, isLoading } = useBook()
  const midPrice = book?.midPrice

  const { mangrove } = useMangrove()
  const { kandelStrategies } = useKandel()
  return useQuery({
    queryKey: [
      "kandel-requirements",
      availableBase,
      availableQuote,
      minPrice,
      maxPrice,
      midPrice,
      stepSize,
      numberOfOffers,
      market?.base.address,
      market?.quote?.address,
    ],
    queryFn: async () => {
      if (
        !(
          kandelStrategies &&
          // generator &&
          market &&
          midPrice &&
          // config &&
          minPrice &&
          maxPrice &&
          mangrove
        )
      )
        return null

      try {
        // const minimumBasePerOffer =
        //   kandelStrategies.seeder.getMinimumVolumeForGasreq({
        //     market,
        //     offerType: "asks",
        //     factor: 3,
        //     gasreq: mangrove?.logics.simple.gasOverhead + 100_000,
        //   })
        // const minimumQuotePerOffer =
        //   kandelStrategies.seeder.getMinimumVolumeForGasreq({
        //     market,
        //     offerType: "bids",
        //     factor: 3,
        //     gasreq: mangrove?.logics.simple.gasOverhead + 100_000,
        //   })
        // const param: Parameters<
        //   typeof generator.calculateMinimumDistribution
        // >[number] = {
        //   minimumBasePerOffer,
        //   minimumQuotePerOffer,
        //   distributionParams: {
        //     generateFromMid: false,
        //     minPrice,
        //     maxPrice,
        //     stepSize: Number(stepSize) ?? config.stepSize,
        //     midPrice,
        //     pricePoints: Number(numberOfOffers) + 1, // number of offers = price points - 1
        //   },
        // }
        // // Calculate a candidate distribution with the recommended minimum volumes given the price range.
        // const minimumDistribution =
        //   await generator.calculateMinimumDistribution(param)
        // // requiredBase / quote => minimum to use in the fields
        // const { requiredBase, requiredQuote } =
        //   minimumDistribution.getOfferedVolumeForDistribution()
        // const distribution =
        //   await generator.recalculateDistributionFromAvailable({
        //     distribution: minimumDistribution,
        //     availableBase: availableBase ? availableBase : requiredBase,
        //     availableQuote: availableQuote ? availableQuote : requiredQuote,
        //   })
        // const offers = distribution.getOffersWithPrices()
        // const offersWithPrices = {
        //   asks: offers.asks.filter((offer) => offer.gives.gt(0)),
        //   bids: offers.bids.filter((offer) => offer.gives.gt(0)),
        // }
        // // minimum allowed value for gas (or bounty)
        // const requiredBounty =
        //   await kandelStrategies.seeder.getRequiredProvision(
        //     {
        //       type: "smart",
        //       market,
        //       liquiditySharing: false,
        //     },
        //     distribution,
        //     undefined,
        //     undefined,
        //     mangrove?.logics.simple.gasOverhead + 100_000,
        //   )
        // return {
        //   requiredBase,
        //   requiredQuote,
        //   requiredBounty,
        //   distribution,
        //   offersWithPrices,
        //   pricePoints: minimumDistribution.pricePoints,
        // }
      } catch (e) {
        const message = getErrorMessage(e)
        console.error("Error: ", message)
        if (message.includes("revert")) {
          throw new Error(`Error: one of the parameters is invalid`)
        }
        throw message
      }
    },
    enabled: !!(kandelStrategies && market && midPrice),
  })
}
