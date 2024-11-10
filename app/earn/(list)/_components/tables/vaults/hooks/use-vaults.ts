"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import { useMarkets } from "@/hooks/use-addresses"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { getVaultsInformation } from "../../../../../(shared)/_service/vaults-infos"

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
  const plainVaults = useVaultsWhitelist()

  const { data, ...rest } = useQuery({
    queryKey: ["vaults", publicClient?.key, user, chainId, first, skip],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []
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
