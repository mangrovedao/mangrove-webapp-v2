import { arbitrum, base, megaethTestnet, sei } from "viem/chains"
import { useChainId } from "wagmi"

const INDEXER_URLS: Record<number, string> = {
  [megaethTestnet.id]: "https://indexer-testnet.mgvinfra.com",
  [sei.id]: "https://indexer-sei.mgvinfra.com",
  [base.id]: "https://indexer.mgvinfra.com",
  [arbitrum.id]: "https://indexer-arbitrum.mgvinfra.com",
}

const DEFAULT_INDEXER_URL = "https://indexer.mgvinfra.com"

export function getIndexerUrl() {
  const chainId = useChainId()
  if (!chainId) return DEFAULT_INDEXER_URL
  return INDEXER_URLS[chainId] ?? DEFAULT_INDEXER_URL
}
