"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { Vault } from "@/app/earn/(shared)/types"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { PublicClient } from "viem"
import { useAccount } from "wagmi"
import { getVaultsInformation } from "../../../../../(shared)/_service/vaults-infos"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Vault[]) => T
}

// Cache key helper for consistency
const getMyVaultsQueryKey = (
  networkKey?: string,
  user?: string,
  chainId?: number,
  skip = 0,
  first = 10,
) => ["my-vaults", networkKey, user, chainId, skip, first]

export function useMyVaults<T = Vault[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const networkClient = useNetworkClient()
  const { address: user, chainId, isConnected } = useAccount()
  const { defaultChain } = useDefaultChain()
  const queryClient = useQueryClient()

  const plainVaults = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

  // Query key with pagination parameters
  const queryKey = getMyVaultsQueryKey(
    networkClient?.key,
    user,
    defaultChain.id,
    skip,
    first,
  )

  // Get the previous data for all pages as potential placeholder
  const previousVaultsData = queryClient.getQueryData<Vault[]>(
    getMyVaultsQueryKey(networkClient?.key, user, defaultChain.id),
  )

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!networkClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []
        const vaults = await getVaultsInformation(
          networkClient as PublicClient,
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
    placeholderData: previousVaultsData,
    enabled: !!networkClient?.key && !!user && !!plainVaults.length,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Prefetch the next page when we're within 50% of the current page
  useEffect(() => {
    if (data && data.length >= first / 2) {
      const nextPageKey = getMyVaultsQueryKey(
        networkClient?.key,
        user,
        defaultChain.id,
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
            )

            return vaults.filter((v) => v.isActive) || []
          } catch (error) {
            console.error(error)
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
    user,
    defaultChain.id,
    plainVaults,
    incentives,
    queryClient,
  ])

  // Refresh data when connection status changes
  useEffect(() => {
    // When connection status changes, invalidate the cache
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["my-vaults"] })
    }
  }, [isConnected, chainId, user, queryClient])

  return {
    data: (select ? select(data || []) : data) as unknown as T,
    ...rest,
  }
}
