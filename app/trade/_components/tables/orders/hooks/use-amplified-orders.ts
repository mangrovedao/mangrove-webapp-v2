"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useMangrove from "@/providers/mangrove"
import useIndexerSdk from "@/providers/mangrove-indexer"
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
  const { marketsInfoQuery } = useMangrove()
  const { data: openMarkets } = marketsInfoQuery

  const { indexerSdk } = useIndexerSdk()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["amplified", address],
    queryFn: async () => {
      try {
        if (!indexerSdk || !address || !openMarkets) return []
        startLoading(TRADE.TABLES.ORDERS)
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

        const filteredResult = result.filter((order) => {
          const allOffersMarketFound = order.offers.every(
            (offer) => offer.isMarketFound,
          )

          const isExpired = order.expiryDate
          ? new Date(order.expiryDate) < new Date()
          : true

          return allOffersMarketFound && !isExpired
        })

        return parseAmplifiedOrders(filteredResult)
      } catch (e) {
        console.error(e)
        throw new Error("")
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve amplified orders",
    },
    enabled: !!(isConnected && address && indexerSdk && openMarkets),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
