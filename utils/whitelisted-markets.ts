import type Mangrove from "@mangrovedao/mangrove.js"

import { getJsonFromMarketsConfig } from "@/schemas/whitelisted-markets"

export function filterOpenMarketsWithMarketConfig(
  openMarkets: Mangrove.OpenMarketInfo[],
  chainId: number,
): Mangrove.OpenMarketInfo[] {
  const marketsConfig = getJsonFromMarketsConfig()

  if (!marketsConfig) return []
  const networkMarkets = marketsConfig[chainId.toString()]?.map(
    ([tokenAId, tokenBId]) => [tokenAId, tokenBId].join("_"),
  )
  return openMarkets
    .filter(({ base, quote }) => {
      return marketsConfig[chainId.toString()]?.some(
        ([tokenAId, tokenBId]) =>
          (base.id === tokenAId && quote.id === tokenBId) ||
          (quote.id === tokenAId && base.id === tokenBId),
      )
    })
    .sort((a, b) => {
      return (
        (networkMarkets?.indexOf([a.base.id, a.quote.id].join("_")) ?? -1) -
        (networkMarkets?.indexOf([b.base.id, b.quote.id].join("_")) ?? -1)
      )
    })
}
