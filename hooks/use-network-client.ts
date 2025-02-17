import { createPublicClient, http } from "viem"
import { arbitrum } from "viem/chains"

export function useNetworkClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(),
  })
}
