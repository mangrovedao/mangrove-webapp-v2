"use client"

import { useAccount } from "wagmi"

import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useQuery } from "@tanstack/react-query"
import { parseOrders, type Order } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Order[]) => T
}

export function useOrders<T = Order[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { market } = useMarket()
  const { indexerSdk } = useIndexerSdk()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "orders",
      indexerSdk,
      market?.base.address,
      market?.quote.address,
      address,
    ],
    queryFn: async () => {
      if (!(market && indexerSdk && address)) return []
      const result = await indexerSdk?.getOpenLimitOrders({
        base: market.base,
        quote: market.quote,
        first,
        skip,
        maker: address.toLowerCase(),
      })
      return parseOrders(result)
    },
    select,
    meta: {
      error: "Unable to retrieve orders",
    },
    enabled: !!(isConnected && market && indexerSdk),
  })
}
