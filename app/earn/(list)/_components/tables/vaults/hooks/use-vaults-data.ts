"use client"

import { useVaultsList } from "@/app/earn/(shared)/_hooks/use-vaults-list"
import { getVaultIncentives } from "@/app/earn/(shared)/_service/vault-incentives"
import { CompleteVault } from "@/app/earn/(shared)/types"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getVaultsInformation } from "../../../../../(shared)/_service/vaults-infos"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: CompleteVault[]) => T
}

// Cache key helper for consistency
const getVaultsQueryKey = (
  networkKey?: string,
  user?: string,
  chainId?: number,
  skip = 0,
  first = 10,
) => ["vaults", networkKey, user, chainId, skip, first]

export function useVaults<T = CompleteVault[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const networkClient = useNetworkClient()
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()
  const queryClient = useQueryClient()

  const { data: vaultsList } = useVaultsList()

  // Query key with pagination parameters
  const queryKey = getVaultsQueryKey(
    networkClient?.key,
    user,
    defaultChain.id,
    skip,
    first,
  )

  // Get the previous data for all pages as potential placeholder
  const previousVaultsData = queryClient.getQueryData<CompleteVault[]>(
    getVaultsQueryKey(networkClient?.key, user, defaultChain.id),
  )

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn: async (): Promise<CompleteVault[]> => {
      try {
        if (!networkClient?.key) throw new Error("Public client is not enabled")
        if (!vaultsList) throw new Error("Vaults not found")

        // Get incentives data in parallel with other operations
        const incentivesData = await Promise.all(
          vaultsList.map(async (vault) => {
            const data = await getVaultIncentives(
              networkClient,
              vault.address,
              vault.incentives,
            )
            return {
              vault: vault.address,
              total:
                data?.leaderboard.reduce(
                  (sum, entry) => sum + entry.rewards,
                  0,
                ) ?? 0,
            }
          }),
        )

        const vaults = await getVaultsInformation(
          networkClient,
          vaultsList,
          user,
          incentivesData,
        )
        return vaults
      } catch (error) {
        console.error(error)
        return []
      }
    },
    placeholderData: previousVaultsData,
    enabled: !!networkClient?.key && !!user && !!vaultsList?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return {
    data: (select ? select(data || []) : data) as unknown as T,
    ...rest,
  }
}
