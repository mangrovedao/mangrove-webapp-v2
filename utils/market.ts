import type { Mangrove, Market } from "@mangrovedao/mangrove.js"

export function baToBs(ba: Market.BA): Market.BS {
  return ba === "asks" ? "buy" : "sell"
}

export function bsToBa(bs: Market.BS): Market.BA {
  return bs === "buy" ? "asks" : "bids"
}
// FIXME: This function is not needed - Mangrove.OpenMarketInfo is already a Market.Key
export function marketInfoToMarketParams(marketInfo: Mangrove.OpenMarketInfo) {
  return {
    base: marketInfo.base,
    quote: marketInfo.quote,
    tickSpacing: marketInfo.tickSpacing,
  }
}
