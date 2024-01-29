"use client"

import useIndexerSdk from "@/providers/mangrove-indexer"
import { useQuery } from "@tanstack/react-query"
import { parseStrategy } from "../_schemas/kandel"

type Params = {
  strategyAddress: string
}

export function useStrategy({ strategyAddress }: Params) {
  const { indexerSdk } = useIndexerSdk()
  return useQuery({
    queryKey: ["strategy", strategyAddress],
    queryFn: async () => {
      if (!(indexerSdk && strategyAddress)) return null
      const result = await indexerSdk.getKandel({
        address: strategyAddress,
      })
      return parseStrategy(result)
    },
    meta: {
      error: "Unable to fetch strategy",
    },
    enabled: !!(indexerSdk && strategyAddress),
    retry: false,
  })
}
