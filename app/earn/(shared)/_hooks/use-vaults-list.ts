import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { VaultsResponseSchema } from "../schemas"

export function useVaultsList() {
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["vaults-list", defaultChain.id],
    queryFn: async () => {
      const response = await fetch(
        `https://api.mgvinfra.com/registry/whitelist?chainId=${defaultChain.id}`,
      )
      const data = await response.json()
      console.log(data)
      return VaultsResponseSchema.parse(data)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
