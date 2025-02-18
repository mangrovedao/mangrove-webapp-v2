import { createPublicClient, http } from "viem"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"

export function useNetworkClient() {
  const { isConnected, chain } = useAccount()

  return createPublicClient({
    chain: isConnected ? chain : arbitrum,
    transport: http(),
  })
}
