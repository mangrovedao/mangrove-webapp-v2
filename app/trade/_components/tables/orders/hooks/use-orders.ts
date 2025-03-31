"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { parseOrders, type Order } from "../schema"

type Params<T> = {
  pageSize?: number
  allMarkets?: boolean
  select?: (data: Order[]) => T
}

// Define the response type
type OrdersPage = {
  data: Order[]
  meta: {
    count: number
    hasNextPage: boolean
    page: number
  }
}

export function useOrders<T = Order[]>({
  pageSize = 25,
  allMarkets = false,
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { currentMarket: market } = useMarket()
  const { openMarkets } = useOpenMarkets()
  const { defaultChain } = useDefaultChain()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useInfiniteQuery<OrdersPage>({
    queryKey: [
      "orders-infinite",
      allMarkets ? "all-markets" : market?.base.address,
      allMarkets ? "" : market?.quote.address,
      address,
      pageSize,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!address)
          return {
            data: [],
            meta: { hasNextPage: false, count: 0, page: pageParam as number },
          }
        if (!allMarkets && !market)
          return {
            data: [],
            meta: { hasNextPage: false, count: 0, page: pageParam as number },
          }
        if (allMarkets && (!openMarkets || openMarkets.length === 0))
          return {
            data: [],
            meta: { hasNextPage: false, count: 0, page: pageParam as number },
          }

        startLoading(TRADE.TABLES.ORDERS)

        // Determine which markets to query
        const marketsToQuery =
          allMarkets && openMarkets ? openMarkets : market ? [market] : []

        // Fetch active orders for all specified markets
        const allOrdersPromises = marketsToQuery.map(async (marketItem) => {
          if (!marketItem || !marketItem.base || !marketItem.quote) {
            return { orders: [] }
          }

          try {
            const response = await fetch(
              `https://indexer.mgvinfra.com/orders/active/${defaultChain.id}/${marketItem.base.address}/${marketItem.quote.address}/${marketItem.tickSpacing}?user=${address}&page=${pageParam}&limit=${pageSize}`,
            )

            if (!response.ok) {
              console.warn(
                `Failed to fetch active orders for market ${marketItem.base.symbol}-${marketItem.quote.symbol}`,
              )
              return { orders: [] }
            }

            const data = await response.json()

            // Add market information to each order
            return {
              ...data,
              orders: data.orders?.map((order: any) => ({
                ...order,
                marketBase: marketItem.base.symbol,
                marketQuote: marketItem.quote.symbol,
                baseAddress: marketItem.base.address,
                quoteAddress: marketItem.quote.address,
              })),
            }
          } catch (error) {
            console.error(
              `Error fetching for market ${marketItem.base.symbol}-${marketItem.quote.symbol}:`,
              error,
            )
            return { orders: [] }
          }
        })
        const allOrdersResults = await Promise.all(allOrdersPromises)

        // Combine all order results
        const combinedOrders = allOrdersResults.flatMap(
          (result) => result.orders || [],
        )

        const transformedData = combinedOrders.map((item: any) => {
          // Safe date parsing function that handles invalid or missing timestamps
          const safeDate = (timestamp: number | undefined | null) => {
            // Check if timestamp is valid number and reasonable (after 2010)
            if (
              timestamp &&
              typeof timestamp === "number" &&
              timestamp > 1262304000
            ) {
              try {
                const date = new Date(timestamp * 1000)
                // Verify the date is valid
                if (!isNaN(date.getTime())) {
                  return date
                }
              } catch (e) {
                console.warn("Invalid date parsing", timestamp, e)
              }
            }
            // Return current date as fallback for required date fields
            return new Date()
          }

          return {
            creationDate: safeDate(item.timestamp),
            latestUpdateDate: safeDate(item.timestamp), // Using same timestamp for latest update
            expiryDate: item.expiryDate ? safeDate(item.expiryDate) : undefined,
            transactionHash: item.transactionHash || "",
            isBid: item.side === "buy",
            takerGot: item.received?.toString() || "0",
            takerGave: item.sent?.toString() || "0",
            penalty: "0", // Default value as it's not in the raw data
            feePaid: item.fee?.toString() || "0",
            initialWants: item.initialWants?.toString() || "0",
            initialGives: item.initialGives?.toString() || "0",
            price: item.price?.toString() || "0",
            offerId: item.offerId?.toString() || "0",
            inboundRoute: item.inboundRoute || "",
            outboundRoute: item.outboundRoute || "",
            marketBase: item.marketBase,
            marketQuote: item.marketQuote,
            baseAddress: item.baseAddress,
            quoteAddress: item.quoteAddress,
          }
        })

        const parsedData = parseOrders(transformedData || [])

        // Sort by timestamp descending (newest first)
        parsedData.sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime(),
        )

        return {
          data: parsedData,
          meta: {
            count: parsedData.length,
            hasNextPage: parsedData.length >= pageSize,
            page: pageParam as number,
          },
        }
      } catch (e) {
        console.error(getErrorMessage(e))
        return {
          data: [],
          meta: {
            count: 0,
            hasNextPage: false,
            page: pageParam as number,
          },
        }
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    getNextPageParam: (lastPage) => {
      // If we got fewer orders than the requested page size, there are no more pages
      if (!lastPage.meta.hasNextPage) return undefined
      return lastPage.meta.page + 1
    },
    meta: {
      error: "Unable to retrieve open orders",
    },
    enabled: allMarkets
      ? !!isConnected && !!openMarkets
      : !!isConnected && !!market,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
