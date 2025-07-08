"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { useIndexerUrl } from "@/utils/get-indexer-url"

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

type TradesParams = {
  pageSize?: number
  allMarkets?: boolean
}

export function useTrades({
  pageSize = 25,
  allMarkets = false,
}: TradesParams = {}): UseInfiniteTradesResult {
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const chainId = useChainId()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const indexerUrl = useIndexerUrl()

  return useInfiniteQuery<TradesPage, Error>({
    queryKey: [
      "trades",
      allMarkets ? "all-markets" : market?.base.address,
      allMarkets ? "" : market?.quote.address,
      address,
      market?.base.address.toString(),
      market?.quote.address.toString(),
      market?.tickSpacing.toString(),
      pageSize,
      chainId,
      indexerUrl,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      try {
        if (
          !market?.base.address ||
          !market?.quote.address ||
          !market?.tickSpacing
        ) {
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
          `${indexerUrl}/trades/list/${chainId}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?page=${pageParam}&limit=${pageSize}`,
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch trade history for market ${market?.base.symbol}-${market?.quote.symbol}`,
          )
        }

        const result = (await response.json()) as TradesResponse
        console.log("result", result)
        // Transform the response to match our expected format
        const transformedData: Trade[] = result.trades.map((trade) => ({
          ...trade,
        }))

        stopLoading(TRADE.TABLES.ORDERS)

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
    refetchInterval: 2000, // every 2 seconds
  })
}

// Export the complete return type of the useTrades hook
export type UseInfiniteTradesResult = ReturnType<
  typeof useInfiniteQuery<TradesPage, Error>
>
