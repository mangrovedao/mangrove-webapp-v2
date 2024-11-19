"use client"

import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { getVaultsInformation } from "../../../../../(shared)/_service/vaults-infos"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: (Vault | VaultWhitelist)[]) => T
  whitelist?: VaultWhitelist[]
}

export function useVaults<T = Vault[] | undefined>({
  filters: { first = 10, skip = 0 } = {},
  select,
  whitelist = [],
}: Params<T> = {}) {
  const publicClient = usePublicClient()
  const { address: user, chainId } = useAccount()

  const { data, ...rest } = useQuery({
    queryKey: ["vaults", publicClient?.key, user, chainId, whitelist.length],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!whitelist) return []
        const vaults = await getVaultsInformation(publicClient, whitelist, user)
        return vaults
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!publicClient && !!chainId && !!whitelist.length,
  })
  return {
    data: (select ? select(data ?? []) : data) as unknown as T,
    ...rest,
  }
}
