"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { parseFills, type Fill } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Fill[]) => T
}

export function useFills<T = Fill[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { olKeys } = useMarket()
  const { indexerSdk } = useIndexerSdk()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "fills",
      olKeys?.ask.token.address.toLowerCase(),
      olKeys?.bid.token.address.toLowerCase(),
      address,
      first,
      skip,
    ],
    queryFn: async () => {
      if (!(indexerSdk && address && olKeys)) return []
      startLoading(TRADE.TABLES.ORDERS)
      try {
        const result = await indexerSdk.getOrdersHistory({
          ask: olKeys.ask,
          bid: olKeys.bid,
          first,
          skip,
          maker: address.toLowerCase(),
        })
        return parseFills(result)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve fills",
    },
    enabled: !!(isConnected && indexerSdk && olKeys),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
