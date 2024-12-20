"use client"
import type { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { getChainVaults, getVaultsInformation } from "../services/skate-vaults"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Vault[]) => T
}

export function useVaults<T = Vault[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { chainId } = useAccount()
  const publicClient = usePublicClient()
  const { address: user } = useAccount()
  const { data, ...rest } = useQuery({
    queryKey: ["old-vaults", publicClient, user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient) throw new Error("Public client is not enabled")
        if (!chainId) return []
        const plainVaults = getChainVaults(chainId).slice(skip, skip + first)
        return getVaultsInformation(publicClient, plainVaults, user)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!publicClient && !!chainId,
    initialData: [],
  })
  return {
    data: (select ? select(data) : data) as unknown as T,
    ...rest,
  }
}
