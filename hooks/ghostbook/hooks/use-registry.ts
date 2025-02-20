import { useQuery } from "@tanstack/react-query"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { uniClones } from "../lib/registry"

/**
 * Hook that returns the appropriate Uniswap V3 clone configuration based on the connected chain
 * @returns Object containing the selected UniClone configuration
 */
export function useRegistry() {
  const { chain } = useAccount()
  const defaultChainId = chain?.id ?? arbitrum.id

  const { data: uniClone } = useQuery({
    queryKey: ["uni-clone", defaultChainId],
    queryFn: () => uniClones.find((c) => c.chain.id === defaultChainId),
  })

  return {
    uniClones,
    uniClone,
  }
}
