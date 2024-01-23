import { Statuses } from "@mangrovedao/mangrove.js/dist/nodejs/kandel/geometricKandel/geometricKandelStatus"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import useMarket from "@/providers/market"
import { calculateMidPriceFromOrderBook } from "@/utils/market"

export default function useStrategyStatus(strategy: Strategy) {
  const { kandelStrategies } = useKandel()
  const { getMarketFromAddresses } = useMarket()
  return useQuery({
    queryKey: ["stategy-status", strategy.address],
    queryFn: async () => {
      try {
        const market = await getMarketFromAddresses(
          strategy.base,
          strategy.quote,
        )
        if (!(kandelStrategies && market)) return []
        const book = await market.requestBook()
        const midPrice = Big(calculateMidPriceFromOrderBook(book) ?? 0)
        const stratInstance = await kandelStrategies.instance({
          address: strategy.address,
          market,
        })

        const asksBalance = await stratInstance.getBalance("asks") // base
        const bidsBalance = await stratInstance.getBalance("bids") // quote
        const hasBalance = asksBalance.gt(0) && bidsBalance.gt(0)
        const anyLiveOffers = strategy.offers.some((x) => x?.live === true)
        let isOutOfRange = false
        let unexpectedDeadOffers = false
        let offerStatuses: Statuses | null = null
        let status = "unknown"
        if (!anyLiveOffers) {
          status = hasBalance ? "inactive" : "closed"
        } else {
          offerStatuses = await stratInstance.getOfferStatusFromOffers({
            offers: {
              bids: strategy.offers
                .filter((x) => x.offerType === "bids")
                .map(({ offerId, index, live }) => ({
                  id: offerId,
                  index,
                  live,
                  tick: 0, // TODO: I don't have the info
                })),
              asks: strategy.offers
                .filter((x) => x.offerType === "asks")
                .map(({ offerId, index, live }) => ({
                  id: offerId,
                  index,
                  live,
                  tick: 0, // TODO: I don't have the info
                })),
            },
            midPrice,
          })

          isOutOfRange =
            midPrice.gt(offerStatuses.maxPrice) ||
            midPrice.lt(offerStatuses.minPrice)

          unexpectedDeadOffers = offerStatuses.statuses.some(
            (x) =>
              (x.expectedLiveAsk && !x.asks?.live) ||
              (x.expectedLiveBid && !x.bids?.live),
          )
          status = "active"
          if (isOutOfRange || unexpectedDeadOffers) {
            status = "inactive"
          }
        }
        return {
          status,
        }
      } catch (error) {}
    },
    enabled: !!strategy.address,
  })
}
