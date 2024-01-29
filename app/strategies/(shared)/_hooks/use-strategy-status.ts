import { Statuses } from "@mangrovedao/mangrove.js/dist/nodejs/kandel/geometricKandel/geometricKandelStatus"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import useMarket from "@/providers/market"
import { calculateMidPriceFromOrderBook } from "@/utils/market"

export type Status = "active" | "inactive" | "closed" | "unknown"

type Params = Partial<Pick<Strategy, "address" | "base" | "quote" | "offers">>

export default function useStrategyStatus({
  address,
  base,
  quote,
  offers,
}: Params) {
  const { kandelStrategies } = useKandel()
  const { getMarketFromAddresses } = useMarket()
  return useQuery({
    queryKey: ["stategy-status", address],
    queryFn: async () => {
      try {
        if (!address || !base || !quote || !offers) return null
        const market = await getMarketFromAddresses(base, quote)
        if (!(kandelStrategies && market)) return null
        const book = await market.requestBook()
        const midPrice = Big(calculateMidPriceFromOrderBook(book) ?? 0)
        const stratInstance = await kandelStrategies.instance({
          address: address,
          market,
        })

        const asksBalance = await stratInstance.getBalance("asks") // base
        const bidsBalance = await stratInstance.getBalance("bids") // quote
        const hasBalance = asksBalance.gt(0) && bidsBalance.gt(0)
        const anyLiveOffers = offers.some((x) => x?.live === true)
        let isOutOfRange = false
        let unexpectedDeadOffers = false
        let offerStatuses: Statuses | null = null
        let status: Status = "unknown"
        if (!anyLiveOffers) {
          status = hasBalance ? "inactive" : "closed"
        } else {
          const bids = offers.filter((x) => x.offerType === "bids")
          const asks = offers.filter((x) => x.offerType === "asks")
          offerStatuses = await stratInstance.getOfferStatusFromOffers({
            offers: {
              bids: bids.length
                ? bids.map(({ offerId, index, live, tick }) => ({
                    id: offerId,
                    index,
                    live,
                    tick: Number(tick),
                  }))
                : [],
              asks: asks.length
                ? asks.map(({ offerId, index, live, tick }) => ({
                    id: offerId,
                    index,
                    live,
                    tick: Number(tick),
                  }))
                : [],
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
          asksBalance,
          bidsBalance,
        }
      } catch (error) {
        console.error(error)
        throw new Error("failed to determine strategy status")
      }
    },
    enabled: !!address && !!base && !!quote && !!offers,
  })
}
