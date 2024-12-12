"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { arbitrum } from "viem/chains"
import { z } from "zod"
import { parseOrders, rawOrderSchema, type Order } from "../schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Order[]) => T
}

const ordersSchema = z.object({
  orders: z.array(rawOrderSchema),
  count: z.number(),
  totalPages: z.number(),
})

export function useOrders<T = Order[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected, chainId } = useAccount()
  const { markets, currentMarket } = useMarket()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  const currentChainId = chainId ?? arbitrum.id

  const sortedMarkets = currentMarket
    ? [currentMarket, ...markets.filter((m) => m !== currentMarket)]
    : markets

  return useQuery({
    queryKey: [
      "orders",
      address,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      first,
      skip,
    ],
    queryFn: async () => {
      if (!(address && markets.length)) return []
      startLoading(TRADE.TABLES.ORDERS)

      try {
        const allOrders = await Promise.all(
          sortedMarkets.map(async (market) => {
            const response = await fetch(
              `https://${currentChainId}-mgv-data.mgvinfra.com/orders/active/${currentChainId}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?user=${address}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            ).then(async (res) => await res.json())

            const result = ordersSchema.parse(response)

            return result.count > 0
              ? parseOrders(
                  result.orders.sort((a, b) => b.expiry - a.expiry),
                  market,
                )
              : []
          }),
        )

        return allOrders.flat()
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve orders",
    },
    enabled: !!(isConnected && markets.length),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
