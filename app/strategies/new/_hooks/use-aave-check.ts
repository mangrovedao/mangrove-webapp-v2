import { useAaveKandelRouter } from "@/hooks/use-addresses"
import { printEvmError } from "@/utils/errors"
import { MarketParams, aaveKandelActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { usePublicClient } from "wagmi"

export function useCanUseAave(market?: MarketParams) {
  const publicClient = usePublicClient()
  const routerAddress = useAaveKandelRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "can-use-aave",
      market?.base.address,
      market?.quote.address,
      routerAddress,
    ],
    queryFn: async () => {
      try {
        if (!publicClient || !routerAddress || !market) return null

        const canUse = await publicClient
          .extend(aaveKandelActions(routerAddress as Address))
          .checkAaveMarket({ market })

        return canUse
      } catch (error) {
        printEvmError(error)
        return null
      }
    },
    enabled: !!routerAddress,
  })
  return {
    data,
    isLoading,
    isError,
  }
}
