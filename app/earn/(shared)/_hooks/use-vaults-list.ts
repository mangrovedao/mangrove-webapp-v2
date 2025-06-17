import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { ZodError } from "zod"
import { VaultsResponseSchema } from "../schemas"
import { getCurrentIncentive } from "../utils"

export function useVaultsList() {
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["vaults-list", defaultChain.id],
    queryFn: async () => {

      try {
        const response = await fetch(
          `https://api.mgvinfra.com/registry/whitelist?chainId=${defaultChain.id}`,
        )

        const data = await response.json()
        const parsedData = VaultsResponseSchema.parse(data)

        return parsedData.map((vault) => ({
          ...vault,
          incentives: getCurrentIncentive(vault.incentives),
        }))
      } catch (error) {
        if (error instanceof ZodError) {
          console.error("Error fetching vaults list:", error.message)
        } else {
          console.error("Error fetching vaults list:", error)
        }
        return []
      }
    },
    enabled: !!defaultChain.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
