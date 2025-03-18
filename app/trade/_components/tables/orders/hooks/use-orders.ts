"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { parseOrders, type Order } from "../schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Order[]) => T
}

export function useOrders<T = Order[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { currentMarket: market } = useMarket()
  const { defaultChain } = useDefaultChain()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "orders",
      market?.base.address,
      market?.quote.address,
      address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        if (!(address && market)) return []
        startLoading(TRADE.TABLES.ORDERS)

        const activeOrders = await fetch(
          `https://indexer.mgvinfra.com/orders/history/${defaultChain.id}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?user=${address}&page=${0}&limit=${first}`,
        ).then(async (res) => await res.json())

        console.log(activeOrders)
        const parsedData = parseOrders(activeOrders)
        return parsedData
      } catch (e) {
        console.error(getErrorMessage(e))
        return []
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve open orders",
    },
    enabled: !!isConnected,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
