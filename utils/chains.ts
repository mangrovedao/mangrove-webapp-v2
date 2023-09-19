import { env } from "@/env.mjs"
import * as wagmiChains from "wagmi/chains"
import { type Chain } from "wagmi/chains"

const WHITELISTED_CHAIN_IDS = env.NEXT_PUBLIC_WHITELISTED_CHAIN_IDS
const DEFAULT_CHAIN_ID = "80001"
const CHAIN_IDS = WHITELISTED_CHAIN_IDS
  ? WHITELISTED_CHAIN_IDS.includes(",")
    ? WHITELISTED_CHAIN_IDS.split(",")
    : [WHITELISTED_CHAIN_IDS]
  : [DEFAULT_CHAIN_ID]
export const TARGET_NETWORK_CHAIN_ID = WHITELISTED_CHAIN_IDS
  ? WHITELISTED_CHAIN_IDS.includes(",")
    ? WHITELISTED_CHAIN_IDS.split(",")[0]
    : WHITELISTED_CHAIN_IDS
  : DEFAULT_CHAIN_ID

type WagmiChains = Record<string, Chain>

export function getWhitelistedChainObjects() {
  const result = []
  for (const chainName in wagmiChains) {
    const chainObject = (wagmiChains as WagmiChains)[chainName]
    if (chainObject && CHAIN_IDS.includes(chainObject.id.toString())) {
      result.push(chainObject)
    }
  }
  return result
}

export function getChainObjectById(chainId: string): Chain | undefined {
  for (const chainName in wagmiChains) {
    const chainObject: Chain | undefined = (wagmiChains as WagmiChains)[
      chainName
    ]
    if (chainObject?.id.toString() === chainId) {
      return chainObject
    }
  }

  // return undefined if no matching chain is found
  return undefined
}
