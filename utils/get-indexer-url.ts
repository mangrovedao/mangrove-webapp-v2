// utils/get-indexer-url.ts
import { Chain } from "viem"
import { arbitrum, base, megaethTestnet, sei } from "viem/chains"

export function getIndexerUrl(chain?: Chain | null): string {
  switch (chain?.id) {
    case megaethTestnet.id:
      return "https://indexer-testnet.mgvinfra.com"
    case sei.id:
      return "https://indexer-sei.mgvinfra.com"
    case base.id:
      return "https://indexer.mgvinfra.com"
    case arbitrum.id:
      return "https://indexer-arbitrum.mgvinfra.com"
    default:
      return "https://indexer.mgvinfra.com"
  }
}
