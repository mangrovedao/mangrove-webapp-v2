import Big from "big.js"

import { type Market } from "@mangrovedao/mangrove.js"

export function calculateCumulative(
  offers: Market.Offer[] | undefined,
  isAsk = false,
) {
  let cumulativeVolume = Big(0)
  const calculatedOffers =
    offers?.map((offer) => {
      cumulativeVolume = cumulativeVolume.plus(offer.volume)
      return {
        ...offer,
        volume: cumulativeVolume,
      }
    }) ?? []

  // Add an extended offer to the end of the array
  const highestOffer = calculatedOffers[calculatedOffers.length - 1]
  const extendedPrice = Big(highestOffer?.price ?? 0).times(1.1)

  if (highestOffer && isAsk) {
    const extendedOffer = {
      ...highestOffer,
      price: extendedPrice,
      volume: cumulativeVolume,
      id: 0,
    } // Set volume to cumulativeVolume
    calculatedOffers.push(extendedOffer)
  }

  return calculatedOffers
}

export function getNumTicksBasedOnDecimals(
  value: number,
  minTicks = 2,
  maxTicks = 5,
) {
  // Convert the value to a string to check its decimal part
  const valueString = value.toString()

  // Check if the value is less than 1 and has more than 4 consecutive zeros in decimals
  if (value < 1 && /\.\d*0000\d*$/.test(valueString)) {
    return minTicks // Show fewer ticks for such numbers
  }
  return maxTicks // Show more ticks for other values
}

export function formatNumber(n: number, isCompact: boolean = n >= 500) {
  // If the value is very small, use fixed notation with decimals.
  if (Math.abs(n) < 1) {
    return n.toString()
  }
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

export function toNumberIfBig(value?: Big | number): number {
  return value ? (isBig(value) ? value.toNumber() : value) : 0
}
