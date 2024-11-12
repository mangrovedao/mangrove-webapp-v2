"use client"

import { useQuery } from "@tanstack/react-query"

import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { getSemibooksOLKeys, hash } from "@mangrovedao/mgv/lib"
import { parseTradeHistory, type TradeHistory } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: TradeHistory[]) => T
}

export function useTradeHistory<T = TradeHistory[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { currentMarket: market } = useMarket()
  const { indexerSdk } = useIndexerSdk()

  return useQuery({
    queryKey: [
      "trade-history",
      market?.base.address,
      market?.quote.address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        if (!(indexerSdk && market)) return []
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)
        const result = await indexerSdk.getMarketHistory({
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
        })
        return parseTradeHistory(result)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    select,
    meta: {
      error: "Unable to retrieve trade history",
    },
    enabled: !!indexerSdk,
    retry: false,
    staleTime: 1 * 20 * 1000, // 20 secondes
  })
}
