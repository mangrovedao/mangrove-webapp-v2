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
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Vault[]) => T
}

export function useMyVaults<T = Vault[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const publicClient = usePublicClient()
  const { address: user, chainId } = useAccount()
  const markets = useMarkets()

  const { data, ...rest } = useQuery({
    queryKey: ["vaults", publicClient?.key, user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!chainId) return []
        const plainVaults = getChainVaults(chainId)
        // .slice(skip, skip + first)
        const vaults = await getVaultsInformation(
          publicClient,
          plainVaults,
          markets,
          user,
        )

        return vaults.filter((v) => v.isActive)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!publicClient?.key && !!chainId,
    initialData: [],
  })
  return {
    data: (select ? select(data) : data) as unknown as T,
    ...rest,
  }
}