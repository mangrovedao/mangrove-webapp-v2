import { CompleteOffer, Token } from "@mangrovedao/mgv"
import { BA, BS } from "@mangrovedao/mgv/lib"

import useMarket from "@/providers/market"

export function baToBs(ba: BA): BS {
  return ba === BA.asks ? BS.buy : BS.sell
}

export function bsToBa(bs: BS): BA {
  return bs === BS.buy ? BA.asks : BA.bids
}

export function calculateMidPriceFromOrderBook({
  asks,
  bids,
}: {
  asks: CompleteOffer[]
  bids: CompleteOffer[]
}) {
  if (bids.length === 0 || asks.length === 0) {
    return null
  }

  const highestBid = Math.max(...bids.map((bid) => Number(bid.price)))
  const lowestAsk = Math.min(...asks.map((ask) => Number(ask.price)))

  return (highestBid + lowestAsk) / 2
}

export function getSymbol(market?: ReturnType<typeof useMarket>) {
  if (!market) return
  const { currentMarket } = market
  return `${currentMarket?.base?.symbol}/${currentMarket?.quote?.symbol}`
}

export const currentDecimals = (token: Token) => {
  if (token.symbol.includes("USD")) return 6
  return token.displayDecimals
}

export function getValue(market: ReturnType<typeof useMarket>) {
  if (!market) return
  const { currentMarket } = market
  return `${currentMarket?.base.address},${currentMarket?.quote.address}`
}
