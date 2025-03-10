import { useQuery } from "@tanstack/react-query"

import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { useAccount } from "wagmi"
import { useRegistry } from "./ghostbook/hooks/use-registry"
import { getUniBook, mergeOffers } from "./ghostbook/lib/uni_book"
import { useBook } from "./use-book"
import { useNetworkClient } from "./use-network-client"

/**
 * Safely converts a value to BigInt, handling decimal values
 * @param value - The value to convert
 * @param defaultMultiplier - Default multiplier if conversion fails
 * @returns A BigInt value
 */
function safelyConvertToBigInt(
  value: any,
  defaultMultiplier: bigint = 1n,
): bigint {
  try {
    // If the value is a decimal number, we need to convert it to an integer first
    if (
      typeof value === "number" ||
      (typeof value === "string" && value.includes("."))
    ) {
      // Convert to a number, multiply by 1e6 to preserve some decimal precision, and round to an integer
      const scaledValue = Math.round(Number(value) * 1_000_000)
      return (BigInt(scaledValue) * defaultMultiplier) / 1_000_000n
    }

    // If it's already an integer-like value, convert directly
    return BigInt(value) * defaultMultiplier
  } catch (error) {
    console.warn(`Failed to convert value to BigInt: ${value}`, error)
    return defaultMultiplier
  }
}

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

        // Safely convert density values to BigInt
        // Use a default multiplier of 20_000_000n if conversion fails
        const bidsDensityMultiplier = safelyConvertToBigInt(
          book.bidsConfig.density,
          20_000_000n,
        )
        const asksDensityMultiplier = safelyConvertToBigInt(
          book.asksConfig.density,
          20_000_000n,
        )

        console.log("Density values:", {
          bids: book.bidsConfig.density,
          asks: book.asksConfig.density,
          bidsConverted: bidsDensityMultiplier,
          asksConverted: asksDensityMultiplier,
        })

        // Get Uniswap book with density scaled by Mangrove's density
        const uniBook = await getUniBook(
          client,
          currentMarket,
          500,
          bidsDensityMultiplier,
          asksDensityMultiplier,
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
