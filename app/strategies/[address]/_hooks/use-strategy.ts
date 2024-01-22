"use client"

import useIndexerSdk from "@/providers/mangrove-indexer"
import { useQuery } from "@tanstack/react-query"

type Strategy = any

type Params<T> = {
  strategyAddress: string
  select?: (data: Strategy) => T
}

export function useStrategy<T = Strategy>({
  strategyAddress,
  select,
}: Params<T>) {
  const { indexerSdk } = useIndexerSdk()

  return useQuery({
    queryKey: ["strategy", strategyAddress],
    queryFn: async () => {
      if (!(indexerSdk && strategyAddress)) return []
      const result = await indexerSdk.getKandel({
        address: strategyAddress,
      })
      return result
    },
    select,
    meta: {
      error: "Unable to fetch strategy",
    },
    enabled: !!(indexerSdk && strategyAddress),
    retry: false,
  })
}
