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

  const { data: uniswapQuotes } = useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      chain?.id,
      client?.key,
    ],
    queryFn: async () => {
      try {
        if (!currentMarket || !client || !book)
          throw new Error("Get quotes missing params")

        // Get Uniswap book with density scaled by Mangrove's density
        const uniBook = await getUniBook(
          client,
          currentMarket,
          500,
          BigInt(book.bidsConfig.density) * 20_000_000n,
          BigInt(book.asksConfig.density) * 20_000_000n,
          30,
          uniClone,
        )

        // Merge both orderbooks
        const mergedBook = mergeOffers(uniBook.asks, uniBook.bids, book)

        return mergedBook
      } catch (error) {
        printEvmError(error)
        return { asks: [], bids: [] }
      }
    },
    enabled: !!currentMarket && !!client && !!book,
    refetchInterval: 3000,
  })

  return { asks: uniswapQuotes?.asks || [], bids: uniswapQuotes?.bids || [] }
}
