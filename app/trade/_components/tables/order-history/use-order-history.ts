"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useMgvInfra } from "@/hooks/use-mgv-infra"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { z } from "zod"
import { parseOrderHistory, rawOrderHistory, type OrderHistory } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: OrderHistory[]) => T
}

export function useOrderHistory<T = OrderHistory[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { currentMarket, markets } = useMarket()
  const { indexerSdk } = useIndexerSdk()
  const { mgvInfraUrl, chainId: currentChainId } = useMgvInfra()

  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const sortedMarkets = currentMarket
    ? [currentMarket, ...markets.filter((m) => m !== currentMarket)]
    : markets

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "order-history",
      currentMarket?.base.address,
      currentMarket?.quote.address,
      markets.length,
      address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        startLoading(TRADE.TABLES.ORDER_HISTORY)
        if (!(address && markets.length)) return []

        const allOrders = await Promise.all(
          sortedMarkets.map(async (market) => {
            const response = await fetch(
              `${mgvInfraUrl}/orders/history/${currentChainId}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?user=${address}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            ).then(async (res) => await res.json())

            const orderHistorySchema = z.object({
              count: z.number(),
              totalPages: z.number(),
              orders: z.array(rawOrderHistory),
            })

            const result = orderHistorySchema.parse(response)

            return result.count > 0
              ? parseOrderHistory(
                  result.orders.sort((a, b) => b.block - a.block),
                  market,
                )
              : []
          }),
        )
        console.log(allOrders.flat())
        return allOrders.flat()
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      } finally {
        stopLoading(TRADE.TABLES.ORDER_HISTORY)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve order history",
    },
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
