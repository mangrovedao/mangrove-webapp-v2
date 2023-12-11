"use client"

import { useAccount } from "wagmi"

import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useQuery } from "@tanstack/react-query"
import { parseFills, type Fill } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Fill[]) => T
}

export function useFills<T = Fill[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { olKeys } = useMarket()
  const { indexerSdk } = useIndexerSdk()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "fills",
      indexerSdk,
      address,
      olKeys?.ask.token.address,
      olKeys?.bid.token.address,
      first,
      skip,
    ],
    queryFn: async () => {
      if (!(indexerSdk && address && olKeys)) return []
      const result = await indexerSdk.getOrdersHistory({
        ask: olKeys.ask,
        bid: olKeys.bid,
        first,
        skip,
        maker: address.toLowerCase(),
      })
      return parseFills(result)
    },
    select,
    meta: {
      error: "Unable to retrieve fills",
    },
    enabled: !!(isConnected && olKeys && indexerSdk),
  })
}
