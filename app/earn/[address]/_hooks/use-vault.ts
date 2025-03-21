import { isAddress } from "viem"
import { useAccount } from "wagmi"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useQuery } from "@tanstack/react-query"
import { useVaultsWhitelist } from "../../(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "../../(shared)/_hooks/use-vaults-incentives"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"
import { useMgvFdv } from "../../(shared)/store/vault-store"

export function useVault(address?: string | null) {
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()

  const networkClient = useNetworkClient()
  const vaultsWhitelist = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

  const { fdv } = useMgvFdv()

  return useQuery({
    queryKey: [
      "vault",
      address,
      user,
      defaultChain.id,
      vaultsWhitelist.length,
      incentives.length,
    ],
    queryFn: async () => {
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
    enabled: !!networkClient && !!vaultsWhitelist.length,
    initialData: { vault: undefined },
  })
}
