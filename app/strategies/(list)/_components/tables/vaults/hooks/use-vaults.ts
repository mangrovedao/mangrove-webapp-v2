"use client"
import type { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import { useQuery } from "@tanstack/react-query"
import { useAccount, useChainId, usePublicClient } from "wagmi"
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
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { address: user } = useAccount()
  const { data, ...rest } = useQuery({
    queryKey: ["vaults", user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      if (!publicClient) throw new Error("Public client is not enabled")
      const plainVaults = getChainVaults(chainId).slice(skip, skip + first)
      console.log("plainVaults", plainVaults)
      return getVaultsInformation(publicClient, plainVaults, user)
    },
    enabled: !!publicClient,
    initialData: [],
  })
  return {
    data: (select ? select(data) : data) as unknown as T,
    ...rest,
  }
}
