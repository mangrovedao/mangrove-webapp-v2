"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import { useMarkets } from "@/hooks/use-addresses"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { getVaultsInformation } from "../../../../../(shared)/_service/vaults-infos"

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
  const plainVaults = useVaultsWhitelist()

  const { data, ...rest } = useQuery({
    queryKey: ["my-vaults", publicClient?.key, user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []
        const vaults = await getVaultsInformation(
          publicClient,
          plainVaults,
          user,
        )
        return vaults.filter((v) => v.isActive)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!publicClient?.key && !!user && !!chainId && !!plainVaults.length,
    gcTime: 0,
    // initialData: [],
  })
  return {
    data: (select ? select(data || []) : data) as unknown as T,
    ...rest,
  }
}
