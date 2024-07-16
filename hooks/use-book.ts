import useMarket from "@/providers/market.new"
import type { BookParams, CompleteOffer } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { useMarketClient } from "./use-market"

export type UseBookParams = BookParams & {
  aggregateOffersWithSamePrice?: boolean
}

const aggregateOffers = (offers: CompleteOffer[]) => {
  const aggregated = offers.reduce(
    (acc, offer) => {
      const { price, volume, total } = offer
      if (!acc[price]) {
        acc[price] = { ...offer, total: total }
      } else {
        acc[price]!.volume += volume
        acc[price]!.total += total
      }
      return acc
    },
    {} as { [price: number]: CompleteOffer },
  )
  return Object.values(aggregated)
}

export function useBook(
  params: UseBookParams = {
    aggregateOffersWithSamePrice: false,
  },
) {
  const client = useMarketClient()
  const { currentMarket } = useMarket()

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "book",
      params,
      client?.chain?.id,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      currentMarket?.tickSpacing.toString(),
    ],
    queryFn: async () => {
      if (!client) return null
      let book = await client.getBook(params || {})

      if (params?.aggregateOffersWithSamePrice) {
        book.bids = aggregateOffers(book.bids)
        book.asks = aggregateOffers(book.asks)
      }

      return {
        book,
      }
    },
    enabled: !!client,
    refetchInterval: 3000,
  })
  return {
    book: data?.book,
    isLoading,
    isError,
  }
}
