// utils/get-indexer-url.ts
import { Chain } from "viem"

export function getIndexerUrl(chain?: Chain | null): string {
  // Check if chain exists and if it's a testnet
  if (chain?.testnet) {
    return process.env.NEXT_PUBLIC_TESTNET_INDEXER_URL || ""
  }

  // Default to mainnet
  return process.env.NEXT_PUBLIC_MAINNET_INDEXER_URL || ""
}
