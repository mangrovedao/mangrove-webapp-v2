"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { hash } from "@mangrovedao/mgv"
import { getSemibooksOLKeys } from "@mangrovedao/mgv/lib"
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
  const { indexerSdk } = useIndexerSdk()
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
      if (!(indexerSdk && address && market)) return []
      startLoading(TRADE.TABLES.ORDERS)

      try {
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)
        
        const result = await indexerSdk.getOpenLimitOrders({
          ask: {
            token: {
              address: asksMarket.outbound_tkn,
              decimals: market.base.decimals,
            },
            olKey: hash(asksMarket),
          },
          bid: {
            token: {
              address: bidsMarket.outbound_tkn,
              decimals: market.quote.decimals,
            },
            olKey: hash(bidsMarket),
          },
          first,
          skip,
          maker: address.toLowerCase(),
        })

        return parseOrders(result)
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
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
