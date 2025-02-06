import useMarket from "@/providers/market"
import { type BookParams, type CompleteOffer } from "@mangrovedao/mgv"
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
  uniswapQuotes?: { asks: CompleteOffer[]; bids: CompleteOffer[] },
) {
  const client = useMarketClient()
  const { currentMarket } = useMarket()
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "book",
      params,
      client?.key,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      currentMarket?.tickSpacing.toString(),
      uniswapQuotes?.asks[0]?.price.toString(),
      uniswapQuotes?.bids[0]?.price.toString(),
    ],
    queryFn: async () => {
      try {
        if (!client) return null

        const book = await client.getBook(params || {})

        if (params?.aggregateOffersWithSamePrice) {
          book.bids = aggregateOffers(book.bids)
          book.asks = aggregateOffers(book.asks).reverse()
        }

        if (uniswapQuotes?.asks && uniswapQuotes?.bids) {
          console.log("uniswapQuotes", uniswapQuotes)
          book.asks = [
            ...aggregateOffers(book.asks).reverse(),
            ...uniswapQuotes.asks,
          ]
          book.bids = [...aggregateOffers(book.bids), ...uniswapQuotes.bids]
        }

        return { book }
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!client?.key,
    refetchInterval: 3000,
  })
  return {
    book: data?.book,
    isLoading,
    isError,
  }
}
