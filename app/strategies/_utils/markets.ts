import type Mangrove from "@mangrovedao/mangrove.js"

export function getSymbol(market?: Mangrove.OpenMarketInfo) {
  if (!market) return
  return `${market?.base?.symbol}/${market?.quote?.symbol}`
}

export function getValue(market: Mangrove.OpenMarketInfo) {
  return `${market.base.id},${market.quote.id}`
}
