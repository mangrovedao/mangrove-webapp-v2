"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { getVaultIncentives } from "@/app/earn/(shared)/_service/vault-incentives"
import { getVaultsInformation } from "@/app/earn/(shared)/_service/vaults-infos"
import { useMgvFdv } from "@/app/earn/(shared)/store/vault-store"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { PublicClient } from "viem"
import { useAccount } from "wagmi"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: (Vault | VaultWhitelist)[]) => T
  whitelist?: VaultWhitelist[]
}

// Cache key helper for consistency
const getVaultsQueryKey = (
  networkKey?: string,
  fdv?: number,
  user?: string,
  chainId?: number,
  skip = 0,
  first = 10,
) => ["vaults", networkKey, fdv, user, chainId, skip, first]

export function useVaults<T = Vault[] | undefined>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const networkClient = useNetworkClient()
  const { address: user, chainId, isConnected } = useAccount()
  const plainVaults = useVaultsWhitelist()
  const incentives = useVaultsIncentives()
  const { fdv } = useMgvFdv()
  const queryClient = useQueryClient()

  // Query key with pagination parameters
  const queryKey = getVaultsQueryKey(
    networkClient?.key,
    fdv,
    user,
    chainId,
    skip,
    first,
  )

  // Get the previous data for all pages as potential placeholder
  const previousVaultsData = queryClient.getQueryData<Vault[]>(
    getVaultsQueryKey(networkClient?.key, fdv, user, chainId),
  )

  // Setup the main query
  const { data, ...rest } = useQuery({
    queryKey,
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!networkClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []

        // Use the loading store to show loading state for UI feedback
        // while still leveraging stale data

        // Get incentives data in parallel with other operations
        const incentivesData = await Promise.all(
          plainVaults.map(async (vault) => {
            const data = await getVaultIncentives(
              networkClient as PublicClient,
              incentives.find(
                (i) => i.vault.toLowerCase() === vault.address.toLowerCase(),
              ),
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
          networkClient as PublicClient,
          plainVaults,
          user,
          incentives,
          fdv,
          incentivesData,
        )

        return vaults ?? []
      } catch (error) {
        printEvmError(error)
        return []
      }
    },
    placeholderData: previousVaultsData,
    enabled: !!networkClient && !!plainVaults.length,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Prefetch the next page when we're within 50% of the current page
  useEffect(() => {
    if (data && data.length >= first / 2) {
      const nextPageKey = getVaultsQueryKey(
        networkClient?.key,
        fdv,
        user,
        chainId,
        skip + first,
        first,
      )

      queryClient.prefetchQuery({
        queryKey: nextPageKey,
        queryFn: async () => {
          try {
            if (!networkClient?.key)
              throw new Error("Public client is not enabled")
            if (!plainVaults) return []

            const vaults = await getVaultsInformation(
              networkClient as PublicClient,
              plainVaults,
              user,
              incentives,
              fdv,
            )

            return vaults ?? []
          } catch (error) {
            printEvmError(error)
            return []
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    }
  }, [
    data,
    first,
    skip,
    networkClient,
    fdv,
    user,
    chainId,
    plainVaults,
    incentives,
    queryClient,
  ])

  // Refresh data when connection status changes
  useEffect(() => {
    // When connection status changes, invalidate the cache
    queryClient.invalidateQueries({ queryKey: ["vaults"] })
  }, [isConnected, chainId, queryClient])

  return {
    data: (select ? select(data ?? []) : data) as unknown as T,
    ...rest,
  }
}
