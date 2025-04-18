"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { useOpenMarkets } from "@/hooks/use-open-markets"
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
  const { address, isConnected, chainId } = useAccount()

  const { tokens } = useOpenMarkets()
  const tokensList = tokens.map((token) => token.address.toLowerCase())

  return useQuery({
    queryKey: ["strategies", chainId, address, first, skip],
    queryFn: async () => {
      try {
        if (!(address && tokensList && chainId)) return []
        const result: Strategy[] = []

        return parseStrategies(result)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    select,
    meta: {
      error: "Unable to retrieve all strategies",
    },
    enabled: !!(isConnected && address && tokensList && chainId),
    retry: true,
  })
}
