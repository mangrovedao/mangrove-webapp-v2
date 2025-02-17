import useMarket from "@/providers/market"
import { type BookParams, type CompleteOffer } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useRef } from "react"

import { Book } from "@mangrovedao/mgv"
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
        if (!client) throw new Error("No market client found")

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
        return { book: undefined }
      }
    },
    enabled: !!client?.key,
    staleTime: 5000,
    refetchInterval: 3000,
    select: (data: {
      book: Book | undefined
    }): {
      book: Book | undefined
    } => {
      if (!data?.book) {
        return { book: undefined }
      }

      if (data?.book && (data.book.asks?.length || data.book.bids?.length)) {
        prevBookRef.current = {
          asks: data.book.asks,
          bids: data.book.bids,
        }
      }

      return {
        book: isLoading
          ? { ...data?.book, ...prevBookRef.current }
          : data?.book,
      }
    },
  })
  return {
    book: data?.book,
    isLoading,
    isError,
  }
}
