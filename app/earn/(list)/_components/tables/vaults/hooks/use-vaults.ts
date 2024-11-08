"use client"

import { Vault } from "@/app/earn/(shared)/types"
import { useMarkets } from "@/hooks/use-addresses"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import {
  getChainVaults,
  getVaultsInformation,
} from "../../../../../(shared)/_service/vaults-infos"

type Params<T> = {
  chainId?: number
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Vault[]) => T
}

export function useVaults<T = Vault[]>({
  chainId,
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const publicClient = usePublicClient()
  const { address: user } = useAccount()
  const markets = useMarkets()
  const { data, ...rest } = useQuery({
    queryKey: ["vaults", publicClient?.key, user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!chainId) return []
        const plainVaults = getChainVaults(chainId)
        // .slice(skip, skip + first)
        return await getVaultsInformation(
          publicClient,
          plainVaults,
          markets,
          user,
        )
      } catch (error) {
        console.log("error", error)
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
