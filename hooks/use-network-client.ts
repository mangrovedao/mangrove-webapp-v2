import { createFallbackTransport } from "@/config/fallback-transport"
import { createPublicClient, type Chain } from "viem"
import { useAccount } from "wagmi"
import { useDefaultChain } from "./use-default-chain"

/**
 * Hook that creates a public client with fallback RPC providers
 * Uses WebSockets for better performance if WebSocket URLs are available
 */
export function useNetworkClient() {
  const { isConnected, chain } = useAccount()
  const { defaultChain } = useDefaultChain()

  // Make sure we always have a valid chain
  const currentChain = isConnected && chain ? chain : defaultChain

  // Create client with fallback transport that prefers WebSockets
  return createPublicClient({
    chain: currentChain as Chain,
    transport: createFallbackTransport(currentChain as Chain, true),
  })
}
