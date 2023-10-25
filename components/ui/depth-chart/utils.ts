import Big from "big.js"

import { type Offer } from "./schema"

export function calculateCumulative(offers: Offer[]) {
  let cumulativeVolume = Big(0)
  return offers.map((offer) => {
    cumulativeVolume = cumulativeVolume.plus(offer.volume)
    return {
      ...offer,
      volume: cumulativeVolume,
    }
  })
}

export function formatNumber(n: number, isCompact: boolean = n >= 10000) {
  const formattedNumber = Intl.NumberFormat().format(n)

  const compactNumber = Intl.NumberFormat(undefined, {
    compactDisplay: "short",
    notation: "compact",
    minimumSignificantDigits: 2,
  }).format(n)

  return isCompact && compactNumber.length < formattedNumber.length
    ? compactNumber
    : formattedNumber
}

export function isBig(value: unknown): value is Big {
  return value instanceof Big
}

export function toNumberIfBig(value: Big | number): number {
  return isBig(value) ? value.toNumber() : value
}
