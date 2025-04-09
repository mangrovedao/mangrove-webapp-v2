"use client"

import { useQuery } from "@tanstack/react-query"
import { parseStrategy } from "../_schemas/kandel"

type Params = {
  strategyAddress: string
}

export function useStrategy({ strategyAddress }: Params) {
  return useQuery({
    queryKey: ["strategy", strategyAddress],
    queryFn: async () => {
      try {
        if (!strategyAddress) {
          throw new Error("Unable to fetch strategy")
        }
        const result = {}

        return parseStrategy(result)
      } catch (error) {
        console.error(error)
        throw new Error("Unable to fetch strategy")
      }
    },
    meta: {
      error: "Unable to fetch strategy",
    },
    enabled: !!strategyAddress,
    retry: false,
  })
}
