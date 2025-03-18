import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { mangroveChains, uniClones } from "../lib/registry"

/**
 * Hook that provides access to Uniswap V3 clone and Mangrove chain configurations
 *
 * This hook returns:
 * - The full registry of all supported Uniswap V3 clones and Mangrove chains
 * - The specific UniClone configuration for the connected chain
 * - The specific Mangrove chain configuration for the connected chain
 *
 * If no chain is connected, defaults to Arbitrum network.
 *
 * @returns {Object} Registry configuration object containing:
 * @returns {Array} uniClones - Array of all supported Uniswap V3 clone configurations
 * @returns {Array} mangroveChains - Array of all supported Mangrove chain configurations
 * @returns {Object|undefined} uniClone - UniClone configuration for the connected chain
 * @returns {Object|undefined} mangroveChain - Mangrove configuration for the connected chain
 */
export function useRegistry() {
  const { defaultChain } = useDefaultChain()

  const { data: uniClone } = useQuery({
    queryKey: ["uni-clone", defaultChain.id],
    queryFn: () => uniClones.find((c) => c.chain.id === defaultChain.id),
  })

  const { data: mangroveChain } = useQuery({
    queryKey: ["mangrove-chain", defaultChain.id],
    queryFn: () => mangroveChains.find((c) => c.chain.id === defaultChain.id),
  })

  return {
    uniClones,
    mangroveChains,

    uniClone,
    mangroveChain,
  }
}
