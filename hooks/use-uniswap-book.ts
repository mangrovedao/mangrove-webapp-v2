import { useQuery } from "@tanstack/react-query"

import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { useAccount } from "wagmi"
import { useRegistry } from "./ghostbook/hooks/use-registry"
import { getUniBook, mergeOffers } from "./ghostbook/lib/uni_book"
import { useBook } from "./use-book"
import { useNetworkClient } from "./use-network-client"

export function useUniswapBook() {
  const { currentMarket } = useMarket()
  const client = useNetworkClient()
  const { book } = useBook()
  const { chain } = useAccount()
  const { uniClone } = useRegistry()

  return useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      chain?.id,
      client?.key,
    ],
    queryFn: async () => {
      try {
        if (!currentMarket || !client || !book || !uniClone)
          return { asks: [], bids: [] }

        // Get Uniswap book with density scaled by Mangrove's density
        const uniBook = await getUniBook(
          client,
          currentMarket,
          500,
          BigInt(book.bidsConfig.density) * 20_000_000n,
          BigInt(book.asksConfig.density) * 20_000_000n,
          12,
          uniClone,
        )

        // Merge both orderbooks
        const mergedBook = mergeOffers(uniBook.asks, uniBook.bids, book)
        console.log(
          "uniBook",
          uniBook.asks.length,
          uniBook.bids.length,
          mergedBook.asks.length,
          mergedBook.bids.length,
        )

        return mergedBook
      } catch (error) {
        printEvmError(error)
        console.error("Error fetching Uniswap quotes:", error)
        // Return empty book instead of undefined
        return book ? { ...book, asks: [], bids: [] } : { asks: [], bids: [] }
      }
    },
    enabled: !!currentMarket && !!client && !!book && !!uniClone,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
    staleTime: 2000,
  })
}
