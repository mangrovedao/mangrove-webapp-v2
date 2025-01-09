"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { getVaultsInformation } from "@/app/earn/(shared)/_service/vaults-infos"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { printEvmError } from "@/utils/errors"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"

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
}: Params<T> = {}) {
  const publicClient = usePublicClient()
  const { address: user, chainId } = useAccount()
  const plainVaults = useVaultsWhitelist()

  const { data, ...rest } = useQuery({
    queryKey: ["vaults", publicClient?.key, user, chainId, plainVaults.length],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!publicClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []
        const vaults = await getVaultsInformation(
          publicClient,
          plainVaults,
          user,
        )
        return vaults ?? []
      } catch (error) {
        printEvmError(error)
        return []
      }
    },
    enabled: !!publicClient && !!plainVaults.length,
  })
  return {
    data: (select ? select(data ?? []) : data) as unknown as T,
    ...rest,
  }
}
