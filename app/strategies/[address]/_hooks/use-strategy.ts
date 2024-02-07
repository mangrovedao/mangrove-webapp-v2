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
      try {
        if (!(indexerSdk && strategyAddress)) {
          throw new Error("Unable to fetch strategy")
        }
        const result = await indexerSdk.getKandel({
          address: strategyAddress,
        })
        console.log(result)
        return parseStrategy(result)
      } catch (error) {
        console.log("error", error)
        throw new Error("Unable to fetch strategy")
      }
    },
    meta: {
      error: "Unable to fetch strategy",
    },
    enabled: !!(indexerSdk && strategyAddress),
    retry: false,
  })
}
