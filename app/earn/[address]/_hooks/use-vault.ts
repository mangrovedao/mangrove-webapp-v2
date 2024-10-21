import { useMangroveAddresses, useMarkets } from "@/hooks/use-addresses"
import { useQuery } from "@tanstack/react-query"
import { getAddress, isAddress } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { getVaultsInformation } from "../../(list)/_components/tables/vaults/services/vaults-infos"
import { VAULTS_WHITELIST } from "../../(shared)/_hooks/use-vaults-addresses"

export function useVault(id?: string | null) {
  const { chainId } = useAccount()
  const { address: user } = useAccount()
  const publicClient = usePublicClient()
  const params = useMangroveAddresses()
  const markets = useMarkets()
  return useQuery({
    queryKey: ["vault", id, user, params],
    queryFn: async () => {
      if (!publicClient || !params || !user || !chainId)
        throw new Error("Public client is not enabled")
      if (id && !isAddress(id)) throw new Error("Invalid address")
      const vaultAddress = id ? getAddress(id) : id
      const vault = VAULTS_WHITELIST.find((v) => v.address == vaultAddress)
      if (!vault) return { vault: undefined }
      const [vaultInfo] = await Promise.all([
        getVaultsInformation(publicClient, [vault], markets, user).then(
          (v) => v[0],
        ),
      ])
      return {
        vault: vaultInfo,
      }
    },
    enabled: !!publicClient && !!params && !!chainId,
    initialData: { vault: undefined },
  })
}
