import { createPublicClient, http } from "viem"
import { useAccount } from "wagmi"
import { useDefaultChain } from "./use-default-chain"

export function useNetworkClient() {
  const { isConnected, chain } = useAccount()
  const defaultChain = useDefaultChain()

  return createPublicClient({
    chain: isConnected ? chain : defaultChain,
    transport: http(),
  })
}
