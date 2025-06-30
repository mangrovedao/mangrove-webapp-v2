"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { parseTradeHistory, type TradeHistory } from "./schema"

// Define Trade type based on API response
export type Trade = {
  type: string
  price: number
  baseAmount: number
  quoteAmount: number
  timestamp: number
  fee: number
  transactionHash: string
  block: number
}

// Define the response type from the API
type TradesResponse = {
  total: number
  trades: Trade[]
}

// Define the page type for infinity query
export interface TradesPage {
  data: Trade[]
  meta: {
    count: number
    hasNextPage: boolean
    page: number
  }
}

type TradeHistoryParams<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: TradeHistory[]) => T
}

type TradesParams = {
  pageSize?: number
  allMarkets?: boolean
}

export function useTradeHistory<T = TradeHistory[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: TradeHistoryParams<T> = {}) {
  const { currentMarket: market } = useMarket()
  const { defaultChain } = useDefaultChain()

  return useQuery<TradeHistory[], Error, T>({
    queryKey: [
      "trade-history",
      market?.base.address,
      market?.quote.address,
      defaultChain.id,
      first,
      skip,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!market) return []

        const response = await fetch(
          `${getIndexerUrl()}/trades/list/${defaultChain.id}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?page=${pageParam}&limit=${first}`,
        )
        const result = await response.json()

        const parsedData = parseTradeHistory(result)
        return parsedData
      } catch (e) {
        console.error(getErrorMessage(e))
        return []
      }
    },
    select,
    enabled: !!market,
    meta: {
      error: "Unable to retrieve trade history",
    },
    refetchInterval: 10 * 1000, // 10 seconds
  })
}

export function useTrades({
  pageSize = 25,
  allMarkets = false,
}: TradesParams = {}): UseInfiniteTradesResult {
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const { defaultChain } = useDefaultChain()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useInfiniteQuery<TradesPage, Error>({
    queryKey: [
      "trades",
      allMarkets ? "all-markets" : market?.base.address,
      allMarkets ? "" : market?.quote.address,
      address,
      pageSize,
      defaultChain.id,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      try {
        if (!market) {
          return {
            data: [],
            meta: {
              count: 0,
              hasNextPage: false,
              page: Number(pageParam),
            },
          }
        }

        startLoading(TRADE.TABLES.ORDERS)

        const response = await fetch(
          `${getIndexerUrl()}/trades/list/${defaultChain.id}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?page=${pageParam}&limit=${pageSize}`,
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch trade history for market ${market?.base.symbol}-${market?.quote.symbol}`,
          )
        }

        const result = (await response.json()) as TradesResponse

        // Transform the response to match our expected format
        const transformedData: Trade[] = result.trades.map((trade) => ({
          ...trade,
        }))

        return {
          data: transformedData,
          meta: {
            count: result.total,
            hasNextPage: Number(pageParam) * pageSize < result.total,
            page: Number(pageParam),
          },
        }
      } catch (error) {
        console.error(getErrorMessage(error))
        return {
          data: [],
          meta: {
            count: 0,
            hasNextPage: false,
            page: Number(pageParam),
          },
        }
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },

    getNextPageParam: (lastPage) => {
      // If we don't have more pages, return undefined
      if (!lastPage.meta.hasNextPage) return undefined
      return lastPage.meta.page + 1
    },
    meta: {
      error: "Unable to retrieve trade history",
    },
    enabled: !!market,
    refetchInterval: 5 * 1000, // 5 seconds
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Export the complete return type of the useTrades hook
export type UseInfiniteTradesResult = ReturnType<
  typeof useInfiniteQuery<TradesPage, Error>
>
