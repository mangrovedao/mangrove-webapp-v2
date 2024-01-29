"use client"

import { useAccount } from "wagmi"

import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import useIndexerSdk from "@/providers/mangrove-indexer"
import { useQuery } from "@tanstack/react-query"
import { parseStrategies, type Strategy } from "../../../../_schemas/kandels"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Strategy[]) => T
}

export function useStrategies<T = Strategy[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { mangrove } = useMangrove()
  const { address, isConnected } = useAccount()
  const { indexerSdk } = useIndexerSdk()
  const { data: knownTokens } = useWhitelistedMarketsInfos(mangrove, {
    select: (whitelistedMarkets) => {
      const newData = whitelistedMarkets.flatMap(({ base, quote }) => [
        base.address?.toLowerCase(),
        quote.address?.toLowerCase(),
      ])
      return Array.from(new Set(newData))
    },
  })

  return useQuery({
    queryKey: ["strategies", address, first, skip],
    queryFn: async () => {
      if (!(indexerSdk && address && knownTokens)) return []
      const result = await indexerSdk.getKandels({
        owner: address.toLowerCase(),
        first,
        skip,
        knownTokens,
      })
      return parseStrategies(result)
    },
    select,
    meta: {
      error: "Unable to retrieve all strategies",
    },
    enabled: !!(isConnected && indexerSdk && address && knownTokens),
    retry: false,
  })
}
