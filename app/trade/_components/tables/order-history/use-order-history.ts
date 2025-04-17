"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { parseOrderHistory, type OrderHistory } from "./schema"

type Params = {
  pageSize?: number
  allMarkets?: boolean
}

// Define the response type
type OrderHistoryPage = {
  data: OrderHistory[]
  meta: {
    hasNextPage: boolean
    page: number
  }
}

export function useOrderHistory({
  pageSize = 25,
  allMarkets = false,
}: Params = {}) {
  const { defaultChain } = useDefaultChain()
  const { address, isConnected } = useAccount()
  const { currentMarket: market } = useMarket()
  const { openMarkets } = useOpenMarkets()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useInfiniteQuery<OrderHistoryPage>({
    queryKey: [
      "order-history",
      allMarkets ? "all-markets" : market?.base.address,
      allMarkets ? "" : market?.quote.address,
      address,
      pageSize,
      defaultChain.id,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!address)
          return {
            data: [],
            meta: { hasNextPage: false, page: pageParam as number },
          }
        if (!allMarkets && !market)
          return {
            data: [],
            meta: { hasNextPage: false, page: pageParam as number },
          }
        if (allMarkets && (!openMarkets || openMarkets.length === 0))
          return {
            data: [],
            meta: { hasNextPage: false, page: pageParam as number },
          }

        startLoading(TRADE.TABLES.ORDERS)

        // Determine which markets to query
        const marketsToQuery =
          allMarkets && openMarkets ? openMarkets : market ? [market] : []

        // Fetch order history for all specified markets
        const allOrdersPromises = marketsToQuery.map(async (marketItem) => {
          if (!marketItem || !marketItem.base || !marketItem.quote) {
            return { orders: [] }
          }

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_INDEXER_URL}/orders/history/${defaultChain.id}/${marketItem.base.address}/${marketItem.quote.address}/${marketItem.tickSpacing}?user=${address}&page=${pageParam}&limit=${pageSize}`,
            )

            if (!response.ok) {
              console.warn(
                `Failed to fetch orders for market ${marketItem.base.symbol}-${marketItem.quote.symbol}`,
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

        // Transform the raw data to match our schema format
        const transformedData = combinedOrders.map((item: any) => ({
          creationDate: new Date(item.timestamp * 1000),
          transactionHash: item.transactionHash,
          isBid: item.side === "buy",
          takerGot: item.received?.toString() || "0",
          takerGave: item.sent?.toString() || "0",
          penalty: "0", // Default value as it's not in the raw data
          feePaid: item.fee?.toString() || "0",
          initialWants: "0", // Default value as it's not in the raw data
          initialGives: "0", // Default value as it's not in the raw data
          price: item.price?.toString() || "0",
          status: item.status || "",
          isMarketOrder: item.type !== "GTC", // Assuming non-GTC orders are market orders
          marketBase: item.marketBase,
          marketQuote: item.marketQuote,
          baseAddress: item.baseAddress,
          quoteAddress: item.quoteAddress,
        }))

        // Sort by timestamp descending (newest first)
        transformedData.sort(
          (a: any, b: any) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime(),
        )

        const parsedData = parseOrderHistory(transformedData)

        return {
          data: parsedData,
          meta: {
            hasNextPage: parsedData.length >= pageSize,
            page: pageParam as number,
          },
        }
      } catch (e) {
        console.error(getErrorMessage(e))
        return {
          data: [],
          meta: {
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
      error: "Unable to retrieve order history",
    },
    enabled: !!market,
    refetchInterval: 5 * 1000, // 5 seconds
  })
}
