import useMarket from "@/providers/market"
import { type BookParams, type CompleteOffer } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useRef } from "react"

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
  const prevBookRef = useRef<{
    asks: CompleteOffer[]
    bids: CompleteOffer[]
  }>({ asks: [], bids: [] })

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
          book.bids = book.bids
          book.asks = book.asks
        }

        if (uniswapQuotes?.asks && uniswapQuotes?.bids) {
          book.asks = [...uniswapQuotes.asks]
          book.bids = [...uniswapQuotes.bids]
        }

        const sortedBook = {
          ...book,
          asks: aggregateOffers(book.asks),
          bids: aggregateOffers(book.bids),
        }

        return { book: sortedBook }
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!client?.key,
    staleTime: 5000,
    refetchInterval: 3000,
    select: (
      data:
        | { book: { asks: CompleteOffer[]; bids: CompleteOffer[] } }
        | null
        | undefined,
    ): {
      book: { asks: CompleteOffer[]; bids: CompleteOffer[] } | undefined
    } => {
      if (data?.book && (data.book.asks?.length || data.book.bids?.length)) {
        prevBookRef.current = data.book
      }

      return { book: isLoading ? prevBookRef.current : data?.book }
    },
  })
  return {
    book: data?.book,
    isLoading,
    isError,
  }
}
