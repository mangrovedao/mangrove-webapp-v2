import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

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

// Define offer status types for animation support
export type OfferStatus = "new" | "changed" | "unchanged" | "removing"
export type EnhancedOffer = {
  id: any
  price: number
  volume: number
  status: OfferStatus
  transitionStartTime?: number
  [key: string]: any
}

// Helper function to process offers and mark their status
function processOffers(
  newOffers: any[],
  prevOffersMap: Map<string, EnhancedOffer>,
): EnhancedOffer[] {
  const currentOffersMap = new Map<string, EnhancedOffer>()
  const now = Date.now()

  // First pass: Process new offers and mark them with status
  const processedOffers = newOffers.map((offer) => {
    const id = offer.id.toString()
    const prevOffer = prevOffersMap.get(id)

    // Create enhanced offer with status
    const enhancedOffer: EnhancedOffer = {
      ...offer,
      status: "unchanged",
      transitionStartTime: now,
    }

    if (!prevOffer) {
      // This is a new offer
      enhancedOffer.status = "new"
    } else if (
      prevOffer.price !== offer.price ||
      prevOffer.volume !== offer.volume
    ) {
      // This offer has changed
      enhancedOffer.status = "changed"
    } else {
      // This offer is unchanged - keep previous status if it was "new" or "changed"
      // and hasn't completed its animation cycle yet
      const timeSinceTransition = now - (prevOffer.transitionStartTime || 0)
      if (
        (prevOffer.status === "new" || prevOffer.status === "changed") &&
        timeSinceTransition < 1000
      ) {
        enhancedOffer.status = prevOffer.status
        enhancedOffer.transitionStartTime = prevOffer.transitionStartTime
      } else {
        enhancedOffer.status = "unchanged"
      }
    }

    // Add to current map
    currentOffersMap.set(id, enhancedOffer)
    return enhancedOffer
  })

  // Second pass: Find removed offers and add them to the result with "removing" status
  const removedOffers: EnhancedOffer[] = []
  prevOffersMap.forEach((offer, id) => {
    if (!currentOffersMap.has(id) && offer.status !== "removing") {
      // This offer has been removed
      removedOffers.push({
        ...offer,
        status: "removing",
        transitionStartTime: now,
      })
    }
  })

  // Combine current and removing offers
  return [...processedOffers, ...removedOffers]
}

export function useUniswapBook(params: { priceIncrement?: number } = {}) {
  const { currentMarket } = useMarket()
  const client = useNetworkClient()
  const { book } = useBook()

  const { chain } = useAccount()
  const { uniClone } = useRegistry()

  const [asksMap, setAsksMap] = useState<Map<string, EnhancedOffer>>(new Map())
  const [bidsMap, setBidsMap] = useState<Map<string, EnhancedOffer>>(new Map())

  const query = useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      chain?.id,
      client?.key,
      params?.priceIncrement,
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

        // Get Uniswap book with density scaled by Mangrove's density
        const uniBook = await getUniBook(
          client,
          currentMarket,
          500,
          bidsDensityMultiplier,
          asksDensityMultiplier,
          12,
          params?.priceIncrement,
          uniClone,
        )

        // Merge both orderbooks
        const mergedBook = mergeOffers(uniBook.asks, uniBook.bids, book)

        return {
          ...mergedBook,
          asks: mergedBook.asks,
          bids: mergedBook.bids,
        }
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

  // Process and enhance the book data with animation states
  const enhancedData = useMemo(() => {
    const newData = query.data
    if (!newData) return null

    // Process asks and bids to add animation states
    const enhancedAsks = processOffers(newData.asks, asksMap)
    const enhancedBids = processOffers(newData.bids, bidsMap)

    // Merge offers with the same price
    // const mergedAsks = mergeOffersSamePrice(enhancedAsks)
    // const mergedBids = mergeOffersSamePrice(enhancedBids)

    const mergedAsks = enhancedAsks
    const mergedBids = enhancedBids

    // Sort offers and limit to 12 on each side
    const MAX_OFFERS = 12

    // First sort all asks by price (ascending order)
    const allAsksSorted = [...mergedAsks].sort((a, b) => a.price - b.price)

    // For asks, we want to display from highest to lowest price (top to bottom)
    // But we want to select the 12 asks that are CLOSEST to the mid price
    // So we take the first 12 (lowest priced) and reverse them for display
    // const sortedAsks = allAsksSorted.slice(0, MAX_OFFERS).reverse()
    const sortedAsks = allAsksSorted.reverse()

    // First sort all bids by price (descending order)
    const allBidsSorted = [...mergedBids].sort((a, b) => b.price - a.price)

    // For bids, we want to display from highest to lowest price (top to bottom)
    // We take the highest priced bids (which are already sorted correctly)
    // const sortedBids = allBidsSorted.slice(0, MAX_OFFERS)
    const sortedBids = allBidsSorted

    // Update state maps for next cycle
    const newAsksMap = new Map<string, EnhancedOffer>()
    const newBidsMap = new Map<string, EnhancedOffer>()

    sortedAsks.forEach((offer) => {
      newAsksMap.set(offer.id.toString(), offer)
    })

    sortedBids.forEach((offer) => {
      newBidsMap.set(offer.id.toString(), offer)
    })

    // Schedule map updates
    setTimeout(() => {
      setAsksMap(newAsksMap)
      setBidsMap(newBidsMap)
    }, 0)

    return {
      ...newData,
      asks: sortedAsks,
      bids: sortedBids,
    }
  }, [query.data])

  // Helper function to merge offers with the same price - simple and TS-error-free approach
  function mergeOffersSamePrice(offers: EnhancedOffer[]): EnhancedOffer[] {
    // Return early if no offers
    if (!offers || offers.length === 0) return []

    // Determine a reasonable precision - 2 decimal places for most cases
    const pricePrecision = 2

    // Create a map to group offers by price
    const priceGroups: { [price: string]: EnhancedOffer[] } = {}

    // Group offers by price, using fixed precision to handle floating point issues
    for (const offer of offers) {
      // Round the price to fixed precision to avoid floating point comparison issues
      const roundedPrice = Number(offer.price.toFixed(pricePrecision))
      const priceKey = roundedPrice.toString()

      if (!priceGroups[priceKey]) {
        priceGroups[priceKey] = []
      }
      priceGroups[priceKey]?.push(offer)
    }

    const result: EnhancedOffer[] = []

    // Process each price group
    for (const priceKey in priceGroups) {
      if (!Object.prototype.hasOwnProperty.call(priceGroups, priceKey)) continue

      const group = priceGroups[priceKey]

      // Skip empty groups (shouldn't happen)
      if (!group || group.length === 0) continue

      // If only one offer at this price, keep it as is
      if (group.length === 1 && group[0]) {
        result.push(group[0])
        continue
      }

      // Get the first offer as base (with null check)
      const baseOffer = group[0]
      if (!baseOffer) continue // Skip if base offer is somehow undefined

      // Sum up volumes
      let totalVolume = 0
      let hasNewStatus = false
      let hasChangedStatus = false

      // Process all offers in the group
      for (const offer of group) {
        if (offer) {
          // Skip undefined offers
          totalVolume += offer.volume
          if (offer.status === "new") hasNewStatus = true
          if (offer.status === "changed") hasChangedStatus = true
        }
      }

      // Determine final status
      let mergedStatus: OfferStatus = "unchanged"
      if (hasNewStatus) mergedStatus = "new"
      else if (hasChangedStatus) mergedStatus = "changed"

      // Use the rounded price instead of the original price
      const roundedPrice = Number(priceKey)

      // Create merged offer with required properties
      const merged: EnhancedOffer = {
        id: baseOffer.id, // Required by EnhancedOffer
        price: roundedPrice, // Use rounded price for consistency
        volume: totalVolume, // Calculated total volume
        status: mergedStatus, // Determined status
        transitionStartTime: baseOffer.transitionStartTime,
        isMerged: true, // Flag to indicate merged offer
        mergedCount: group.length, // How many offers were merged
        originalOffers: group.filter(Boolean).map((o) => o.id.toString()), // Keep track of original offers
      }

      result.push(merged)
    }

    return result
  }

  // Clean up removed offers after animation completes
  useEffect(() => {
    if (!enhancedData) return

    // After animation duration, filter out "removing" offers
    const cleanupTimer = setTimeout(() => {
      setAsksMap((prevMap) => {
        const newMap = new Map(prevMap)
        prevMap.forEach((offer, id) => {
          if (offer.status === "removing") {
            const now = Date.now()
            const timeSinceRemoval = now - (offer.transitionStartTime || 0)
            // If removal animation has completed (1000ms), remove from map
            if (timeSinceRemoval > 1000) {
              newMap.delete(id)
            }
          }
        })
        return newMap
      })

      setBidsMap((prevMap) => {
        const newMap = new Map(prevMap)
        prevMap.forEach((offer, id) => {
          if (offer.status === "removing") {
            const now = Date.now()
            const timeSinceRemoval = now - (offer.transitionStartTime || 0)
            // If removal animation has completed (1000ms), remove from map
            if (timeSinceRemoval > 1000) {
              newMap.delete(id)
            }
          }
        })
        return newMap
      })
    }, 1000)

    return () => clearTimeout(cleanupTimer)
  }, [enhancedData])

  // Return the enhanced data with animation states
  return {
    ...query,
    data: enhancedData,
  }
}
