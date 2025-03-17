import { base } from "viem/chains"
import { useAccount } from "wagmi"

/**
 * Hook that returns the connected user's chain ID or base.id as fallback
 * @returns The chain ID of the connected user or base.id if not connected
 */
export function useDefaultChain() {
  const { isConnected, chain } = useAccount()

  // Use custom RPC URL if connected with a chain, otherwise use base with custom RPC
  if (isConnected && chain) {
    return chain
  }

  // Create a modified base chain with custom RPC URL
  return {
    ...base,
    rpcUrls: {
      ...base.rpcUrls,
      default: {
        http: [
          process.env.NEXT_PUBLIC_BASE_RPC_URL || base.rpcUrls.default.http[0],
        ],
      },
      public: {
        http: [
          process.env.NEXT_PUBLIC_BASE_RPC_URL || base.rpcUrls.default.http[0],
        ],
      },
    },
  }
}
