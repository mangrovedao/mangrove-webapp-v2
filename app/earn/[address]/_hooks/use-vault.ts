import { useQuery } from "@tanstack/react-query"
import { BaseError, ContractFunctionExecutionError, isAddress } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { useVaultsWhitelist } from "../../(shared)/_hooks/use-vaults-addresses"
import { getVaultsInformation } from "../../(shared)/_service/vaults-infos"

export function useVault(address?: string | null) {
  const { chainId } = useAccount()
  const { address: user } = useAccount()
  const publicClient = usePublicClient()
  const vaultsWhitelist = useVaultsWhitelist()

  return useQuery({
    queryKey: ["vault", address, user, chainId, vaultsWhitelist.length],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("Public client is not enabled")
        if (address && !isAddress(address))
          throw new Error("Invalid vault address")

        const vault = vaultsWhitelist?.find(
          (v) => v.address.toLowerCase() == address?.toLowerCase(),
        )

        if (!vault) return { vault: undefined }

        const [vaultInfo] = await Promise.all([
          getVaultsInformation(publicClient, [vault], user).then((v) => v[0]),
        ])
        return {
          vault: vaultInfo,
        }
      } catch (error) {
        console.error(error)
        if (error instanceof BaseError) {
          const revertError = error.walk(
            (error) => error instanceof ContractFunctionExecutionError,
          )

          if (revertError instanceof ContractFunctionExecutionError) {
            console.log(
              revertError.cause,
              revertError.message,
              revertError.functionName,
              revertError.formattedArgs,
              revertError.details,
            )
          }
        }
        return { vault: undefined }
      }
    },
    enabled: !!publicClient && !!vaultsWhitelist.length,
    initialData: { vault: undefined },
  })
}
