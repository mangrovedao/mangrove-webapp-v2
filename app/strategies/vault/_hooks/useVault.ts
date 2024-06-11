import { useMangroveAddresses } from "@/hooks/use-addresses"
import { kandelActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { getAddress, isAddress, isAddressEqual } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import {
  getChainVaults,
  getVaultsInformation,
} from "../../(list)/_components/tables/vaults/services/skate-vaults"

export function useVault(id?: string | null) {
  const chainId = useChainId()
  const { address: user } = useAccount()
  const publicClient = usePublicClient()
  const params = useMangroveAddresses()
  return useQuery({
    queryKey: ["vault", id, user, params],
    queryFn: async () => {
      if (!publicClient || !params)
        throw new Error("Public client is not enabled")
      if (!id) return { vault: undefined, kandelState: undefined }
      if (!isAddress(id)) throw new Error("Invalid address")
      const vaultAddress = getAddress(id)
      const vault = getChainVaults(chainId).find((v) =>
        isAddressEqual(v.address, vaultAddress),
      )
      if (!vault) return { vault: undefined, kandelState: undefined }
      const [vaultInfo, kandelState] = await Promise.all([
        getVaultsInformation(publicClient, [vault], user).then((v) => v[0]),
        publicClient
          .extend(kandelActions(params, vault.market, vault.kandel))
          .getKandelState(),
      ])
      return {
        vault: vaultInfo,
        kandelState,
      }
    },
    enabled: !!publicClient && !!params,
    initialData: { vault: undefined, kandelState: undefined },
  })
}
