import type Mangrove from "@mangrovedao/mangrove.js"

import { getJsonFromMarketsConfig } from "@/schemas/whitelisted-markets"

export function filterOpenMarketsWithMarketConfig(
  openMarkets: Mangrove.OpenMarketInfo[],
  chainId: number,
): Mangrove.OpenMarketInfo[] {
  const marketsConfig = getJsonFromMarketsConfig()
  if (!marketsConfig) return []
  return openMarkets.filter(({ base, quote }) => {
    // FIXME: This should be using token IDs instead of symbols
    return marketsConfig[chainId.toString()]?.some(
      ([baseSymbol, quoteSymbol]) =>
        base.symbol === baseSymbol && quote.symbol === quoteSymbol,
    )
  })
}
