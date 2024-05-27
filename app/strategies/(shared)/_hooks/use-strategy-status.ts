import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useBook } from "@/hooks/use-book"
import { useMarketClient } from "@/hooks/use-market"
import useMarket from "@/providers/market.new"
import { getTokenPriceInToken } from "@/services/tokens.service"
import { kandelActions } from "@mangrovedao/mgv"
import { Address } from "viem"

export type Status = "active" | "inactive" | "closed" | "unknown"

type Params = Partial<Pick<Strategy, "address" | "base" | "quote" | "offers">>

export default function useStrategyStatus({
  address,
  base,
  quote,
  offers,
}: Params) {
  const { kandelStrategies } = useKandel()
  const { book } = useBook()
  const client = useMarketClient()

  const { currentMarket: market, markets } = useMarket()
  return useQuery({
    queryKey: ["strategy-status", address],
    queryFn: async () => {
      try {
        if (!address || !base || !quote || !offers) return null

        const market = markets?.find((market) => {
          return (
            market.base.address?.toLowerCase() === base?.toLowerCase() &&
            market.quote.address?.toLowerCase() === quote?.toLowerCase()
          )
        })

        const addresses = useMangroveAddresses()
        if (!(kandelStrategies && market && addresses)) return null

        let midPrice = Big(book?.midPrice ?? 0)
        if (!midPrice && market.base.symbol && market.quote.symbol) {
          const { close } = await getTokenPriceInToken(
            market.base.symbol,
            market.quote.symbol,
            "1d",
          )
          midPrice = Big(close)
        }

        const kandelInstance = client?.extend(
          kandelActions(
            addresses,
            market, // the market object
            address as Address, // the kandel seeder address
          ),
        )

        const kandelState = await kandelInstance?.getKandelState({})

        const anyLiveOffers = offers.some((x) => x?.live === true)
        let isOutOfRange = false
        let unexpectedDeadOffers = false
        let offerStatuses
        const bids = kandelState?.bids || []
        const asks = kandelState?.asks || []
        const offersStatuses = [...bids, ...asks]

        const maxPrice = Math.max(...offersStatuses.map((item) => item.price))
        const minPrice = Math.min(...offersStatuses.map((item) => item.price))

        let status: Status = "unknown"
        if (!anyLiveOffers) {
          status = "closed"
        } else {
          offerStatuses = {
            offers: {
              bids: bids.length
                ? bids.map(({ id, gives, index, tick, price, ba }) => ({
                    id,
                    index,
                    live: gives > 0,
                    tick,
                  }))
                : [],
              asks: asks.length
                ? asks.map(({ id, gives, index, tick, price, ba }) => ({
                    id,
                    index,
                    live: gives > 0,
                    tick: Number(tick),
                  }))
                : [],
            },
            midPrice,
          }

          isOutOfRange = midPrice.gt(maxPrice) || midPrice.lt(minPrice)

          unexpectedDeadOffers = [...bids, ...asks].some((x) => x.gives < 0)

          status = "active"
          if (isOutOfRange || unexpectedDeadOffers) {
            status = "inactive"
          }
        }

        return {
          status,
          midPrice,
          maxPrice,
          minPrice,
          market,
          book,
          offerStatuses,
          unexpectedDeadOffers,
          isOutOfRange,
          kandelInstance,
          kandelState,
        }
      } catch (error) {
        console.error(error)
        throw new Error("failed to determine strategy status")
      }
    },
    enabled: !!address && !!base && !!quote && !!offers,
  })
}
