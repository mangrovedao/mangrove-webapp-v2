import { printEvmError } from "@/utils/errors"
import { useQuery } from "@tanstack/react-query"
import { isAddress } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { useVaultsWhitelist } from "../../(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "../../(shared)/_hooks/use-vaults-incentives"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"

export function useVault(address?: string | null) {
  const { chainId } = useAccount()
  const { address: user } = useAccount()
  const publicClient = usePublicClient()
  const vaultsWhitelist = useVaultsWhitelist()
  const incentives = useVaultsIncentives()

  return useQuery({
    queryKey: [
      "vault",
      address,
      user,
      chainId,
      vaultsWhitelist.length,
      incentives.length,
    ],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("Public client is not enabled")
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
            publicClient,
            [vault],
            user,
            vaultIncentives,
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
    enabled: !!publicClient && !!vaultsWhitelist.length,
    initialData: { vault: undefined },
  })
}
