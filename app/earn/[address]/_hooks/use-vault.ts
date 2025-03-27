import { isAddress } from "viem"
import { useAccount } from "wagmi"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useVaultsWhitelist } from "../../(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "../../(shared)/_hooks/use-vaults-incentives"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"
import { useMgvFdv } from "../../(shared)/store/vault-store"
import { Vault, VaultWhitelist } from "../../(shared)/types"

// Type for the query result
type VaultResult = { vault: (Vault & VaultWhitelist) | undefined }

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
  const vaultsWhitelist = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

  const { fdv } = useMgvFdv()

  // Query key with parameters
  const queryKey = getVaultQueryKey(address, user, defaultChain.id)

  // Check for previous data as placeholder
  const previousVaultData = queryClient.getQueryData<VaultResult>(queryKey)

  return useQuery({
    queryKey,
    queryFn: async (): Promise<VaultResult> => {
      try {
        if (!networkClient) throw new Error("Public client is not enabled")
        if (address && !isAddress(address))
          throw new Error("Invalid vault address")

        const vault = vaultsWhitelist?.find(
          (v) => v.address.toLowerCase() == address?.toLowerCase(),
        )

        const vaultIncentives = incentives?.find(
          (v) => v.vault.toLowerCase() == address?.toLowerCase(),
        )

        if (!vault) return { vault: undefined }

        const [vaultInfo] = await Promise.all([
          getVaultsInformation(
            networkClient,
            [vault],
            user,
            vaultIncentives ? [vaultIncentives] : undefined,
            fdv,
          ).then((v) => v[0]),
        ])
        return {
          vault: vaultInfo,
        }
      } catch (error) {
        printEvmError(error)
        return { vault: undefined }
      }
    },
    placeholderData: previousVaultData,
    enabled: !!networkClient && !!vaultsWhitelist.length,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache longer
    refetchOnWindowFocus: false,
    initialData: { vault: undefined },
  })
}
