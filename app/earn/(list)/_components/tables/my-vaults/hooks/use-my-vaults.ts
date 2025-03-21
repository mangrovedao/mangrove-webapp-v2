"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { Vault } from "@/app/earn/(shared)/types"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
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
  const networkClient = useNetworkClient()
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()

  const plainVaults = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

  const { data, ...rest } = useQuery({
    queryKey: [
      "my-vaults",
      networkClient?.key,
      user,
      defaultChain.id,
      first,
      skip,
    ],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!networkClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []
        const vaults = await getVaultsInformation(
          networkClient,
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
    enabled: !!networkClient?.key && !!user && !!plainVaults.length,
    gcTime: 0,
    // initialData: [],
  })
  return {
    data: (select ? select(data || []) : data) as unknown as T,
    ...rest,
  }
}
