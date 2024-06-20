import { kandelActions, publicMarketActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { useClient, usePublicClient } from "wagmi"

import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { getTokenPriceInToken } from "@/services/tokens.service"

export type Status = "active" | "inactive" | "closed" | "unknown"

type Params = Partial<Pick<Strategy, "address" | "base" | "quote" | "offers">>

export default function useStrategyStatus({
  address,
  base,
  quote,
  offers,
}: Params) {
  const client = useClient()
  const addresses = useMangroveAddresses()
  const publicClient = usePublicClient()
  const { markets } = useMarket()
  const market = markets?.find((market) => {
    return (
      market.base.address?.toLowerCase() === base?.toLowerCase() &&
      market.quote.address?.toLowerCase() === quote?.toLowerCase()
    )
  })

  const kandelClient = publicClient?.extend(
    publicMarketActions(addresses!, market!),
  )

  return useQuery({
    queryKey: ["strategy-status", address],
    queryFn: async () => {
      try {
        if (
          !publicClient ||
          !market ||
          !addresses ||
          !address ||
          !base ||
          !quote ||
          !offers
        )
          return null

        const book = await kandelClient?.getBook({})

        let midPrice = Number(book?.midPrice ?? 0)
        if (!midPrice && market.base.symbol && market.quote.symbol) {
          const { close } = await getTokenPriceInToken(
            market.base.symbol,
            market.quote.symbol,
            "1d",
          )
          midPrice = Number(close)
        }

        const kandelInstance = client?.extend(
          kandelActions(
            addresses,
            market, // the market object
            address as Address, // the kandel seeder address
          ),
        )

        const kandelState = await kandelInstance?.getKandelState({})

        let offerStatuses
        const bids = kandelState?.bids || []
        const asks = kandelState?.asks || []
        const offersStatuses = [...bids, ...asks]

        const maxPrice = Math.max(...offersStatuses.map((item) => item.price))
        const minPrice = Math.min(...offersStatuses.map((item) => item.price))

        let isOutOfRange = midPrice > maxPrice || midPrice < minPrice
        let hasLiveOffers = offersStatuses.some((x) => x.gives > 0)
        let status: Status = "unknown"

        if (isOutOfRange) {
          status = "inactive"
        } else if (!hasLiveOffers) {
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
          status = "active"
        }

        return {
          status,
          midPrice,
          maxPrice,
          minPrice,
          market,
          book,
          offerStatuses,
          hasLiveOffers,
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
