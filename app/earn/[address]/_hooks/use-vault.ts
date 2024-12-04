import { useMarkets } from "@/hooks/use-addresses"
import { useQuery } from "@tanstack/react-query"
import { isAddress } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { useVaultsWhitelist } from "../../(shared)/_hooks/use-vaults-addresses"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"

export function useVault(id?: string | null) {
  const { chainId } = useAccount()
  const { address: user } = useAccount()
  const publicClient = usePublicClient()
  const vaultsWhitelist = useVaultsWhitelist()

  const markets = useMarkets()
  return useQuery({
    queryKey: ["vault", id, user, chainId],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client is not enabled")
      if (id && !isAddress(id)) throw new Error("Invalid vaultaddress")

      const vault = vaultsWhitelist?.find(
        (v) => v.address.toLowerCase() == id?.toLowerCase(),
      )
      if (!vault) return { vault: undefined }

      const [vaultInfo] = await Promise.all([
        getVaultsInformation(publicClient, [vault], user).then((v) => v[0]),
      ])
      return {
        vault: vaultInfo,
      }
    },
    enabled: !!publicClient,
    initialData: { vault: undefined },
  })
}
