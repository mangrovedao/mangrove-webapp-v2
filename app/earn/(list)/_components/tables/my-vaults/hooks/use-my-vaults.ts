"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { useTokens } from "@/hooks/use-addresses"
import useIndexerSdk from "@/providers/mangrove-indexer"
import { type Strategy } from "../../../../_schemas/kandels"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Strategy[]) => T
}

export function useMyVaults<T = Strategy[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected, chainId } = useAccount()
  const { indexerSdk } = useIndexerSdk()
  const tokens = useTokens()
  const tokensList = tokens.map((token) => token.address.toLowerCase())

  return useQuery({
    queryKey: ["strategies", chainId, address, first, skip],
    queryFn: async () => {
      try {
        if (!(indexerSdk && address && tokensList && chainId)) return []

        return []
      } catch (error) {
        console.error(error)
        return []
      }
    },
    select,
    meta: {
      error: "Unable to retrieve all strategies",
    },
    enabled: !!(isConnected && indexerSdk && address && tokensList && chainId),
    retry: true,
  })
}
