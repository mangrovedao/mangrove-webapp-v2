import { type Market } from "@mangrovedao/mangrove.js"

import { getJsonFromMarketsConfig } from "@/schemas/whitelisted-markets"

export function filterOpenMarketsWithMarketConfig(
  openMarkets: Market[],
  chainId: number,
): Market[] {
  const marketsConfig = getJsonFromMarketsConfig()
  if (!marketsConfig) return []
  return openMarkets.filter(({ base, quote }) => {
    return marketsConfig[chainId.toString()]?.some(
      ([baseSymbol, quoteSymbol]) =>
        base.symbol === baseSymbol && quote.symbol === quoteSymbol,
    )
  })
}
