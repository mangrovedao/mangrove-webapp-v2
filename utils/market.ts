import type { Mangrove, Market } from "@mangrovedao/mangrove.js"

export function baToBs(ba: Market.BA): Market.BS {
  return ba === "asks" ? "buy" : "sell"
}

export function bsToBa(bs: Market.BS): Market.BA {
  return bs === "buy" ? "asks" : "bids"
}

export function calculateMidPriceFromOrderBook({
  asks,
  bids,
}: {
  asks: Market.Offer[]
  bids: Market.Offer[]
}) {
  if (bids.length === 0 || asks.length === 0) {
    return null
  }

  const highestBid = Math.max(...bids.map((bid) => Number(bid.price)))
  const lowestAsk = Math.min(...asks.map((ask) => Number(ask.price)))

  return (highestBid + lowestAsk) / 2
}

export function getSymbol(market?: Mangrove.OpenMarketInfo) {
  if (!market) return
  return `${market?.base?.symbol}/${market?.quote?.symbol}`
}

export function getValue(market: Mangrove.OpenMarketInfo) {
  return `${market.base.id},${market.quote.id}`
}
