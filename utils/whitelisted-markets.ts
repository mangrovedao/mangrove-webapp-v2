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
      ([tokenAId, tokenBId]) =>
        (base.id === tokenAId && quote.id === tokenBId) ||
        (quote.id === tokenAId && base.id === tokenBId),
    )
  })
}
