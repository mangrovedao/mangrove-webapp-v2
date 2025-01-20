"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { Vault } from "@/app/earn/(shared)/types"
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
  const plainVaults = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

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
          incentives,
        )
        return vaults.filter((v) => v.isActive)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!publicClient?.key && !!user && !!plainVaults.length,
    gcTime: 0,
    // initialData: [],
  })
  return {
    data: (select ? select(data || []) : data) as unknown as T,
    ...rest,
  }
}
