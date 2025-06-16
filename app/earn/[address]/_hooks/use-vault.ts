import { isAddress } from "viem"
import { useAccount } from "wagmi"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useVaultsList } from "../../(shared)/_hooks/use-vaults-list"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"
import { CompleteVault } from "../../(shared)/types"

// Type for the query result
type VaultResult = { vault: CompleteVault | undefined }

// Cache key for consistent querying
const getVaultQueryKey = (
  address: string | undefined | null,
  user?: string,
  chainId?: number,
) => ["vault", address || "", user, chainId]

export function useVault(address?: string | null) {
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()
  const queryClient = useQueryClient()

  const networkClient = useNetworkClient()
  const { data: vaultsList } = useVaultsList()

  // Query key with parameters
  const queryKey = getVaultQueryKey(address, user, defaultChain.id)

  // Check for previous data as placeholder
  const previousVaultData = queryClient.getQueryData<VaultResult>(queryKey)

  // Force refetch on mount to ensure data is fresh, especially for direct page loads
  useEffect(() => {
    // Short delay to ensure providers are fully initialized
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey })
    }, 300)

    return () => clearTimeout(timer)
  }, [queryClient, queryKey, address])

  return useQuery({
    queryKey,
    queryFn: async (): Promise<VaultResult> => {
      try {
        if (!networkClient) throw new Error("Public client is not enabled")
        if (address && !isAddress(address))
          throw new Error("Invalid vault address")

        const vault = vaultsList?.find(
          (v) => v.address.toLowerCase() === address?.toLowerCase(),
        )

        if (!vault) {
          console.warn(`Vault with address ${address} not found in whitelist`)
          return { vault: undefined }
        }

        const [vaultInfo] = await getVaultsInformation(
          networkClient,
          [vault],
          user,
        )

        if (!vaultInfo) {
          throw new Error("Failed to fetch vault information")
        }

        return {
          vault: vaultInfo,
        }
      } catch (error) {
        printEvmError(error)
        console.error("Error fetching vault data:", error)
        throw error // Re-throw to trigger retries
      }
    },
    placeholderData: previousVaultData,
    enabled: !!networkClient && !!vaultsList?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache longer
    refetchOnWindowFocus: true,
    initialData: { vault: undefined },
  })
}
