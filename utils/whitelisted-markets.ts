import type Mangrove from "@mangrovedao/mangrove.js"

import { getJsonFromMarketsConfig } from "@/schemas/whitelisted-markets"

export function filterOpenMarketsWithMarketConfig(
  openMarkets: Mangrove.OpenMarketInfo[],
  chainId: number,
): Mangrove.OpenMarketInfo[] {
  const marketsConfig = getJsonFromMarketsConfig()
  if (!marketsConfig) return []
  return openMarkets.filter(({ base, quote }) => {
    return marketsConfig[chainId.toString()]?.some(
      ([baseId, quoteId]) =>
        (base.id.toLowerCase() === baseId?.toLowerCase() &&
          quote.id.toLowerCase() === quoteId?.toLowerCase()) ||
        (quote.id.toLowerCase() === baseId?.toLowerCase() &&
          base.id.toLowerCase() === quoteId?.toLowerCase()),
    )
  })
}
