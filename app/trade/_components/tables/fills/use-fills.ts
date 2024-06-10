"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market.new"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { getSemibooksOLKeys, hash } from "@mangrovedao/mgv/lib"
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
  const { currentMarket: market } = useMarket()
  const { indexerSdk } = useIndexerSdk()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["fills", address, first, skip],
    queryFn: async () => {
      try {
        if (!(indexerSdk && address && market)) return []
        startLoading(TRADE.TABLES.ORDERS)
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)
        const result = await indexerSdk.getOrdersHistory({
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
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
