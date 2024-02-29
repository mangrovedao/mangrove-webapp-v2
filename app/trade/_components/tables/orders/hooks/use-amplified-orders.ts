"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useMangrove from "@/providers/mangrove"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { AmplifiedOrder, parseAmplifiedOrders } from "../schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: AmplifiedOrder[]) => T
}

export function useAmplifiedOrders<T = AmplifiedOrder[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { olKeys } = useMarket()
  const { marketsInfoQuery } = useMangrove()
  const { data: openMarkets } = marketsInfoQuery

  const { indexerSdk } = useIndexerSdk()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["amplified", address, first, skip],
    queryFn: async () => {
      if (!indexerSdk || !address || !olKeys || !openMarkets) return []
      startLoading(TRADE.TABLES.ORDERS)
      try {
        const markets =
          openMarkets.map((market) => {
            return {
              quote: market.base,
              base: market.quote,
            }
          }) ?? []

        const result = await indexerSdk.getAmplifiedOrders({
          owner: address,
          markets,
        })

        if (!result) return []

        const filteredResult = result.map((order) => {
          if (!order.offers.some((offer) => !offer.isMarketFound)) {
            return order
          }
        })

        return parseAmplifiedOrders(filteredResult)
      } catch (e) {
        console.error(e)
        throw new Error()
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve amplified orders",
    },
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
