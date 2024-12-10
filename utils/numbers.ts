"use client"

import type { Token } from "@mangrovedao/mgv"
import getUserLocale from "get-user-locale"

export function formatNumber(
  value: number | bigint | null,
  options?: Intl.NumberFormatOptions | undefined,
) {
  return Intl.NumberFormat(getUserLocale(), {
    ...options,
  }).format(value ?? 0)
}

export function determineDecimals(
  value: number | bigint | undefined,
  maxDecimals = 6,
) {
  if (value === undefined) return maxDecimals

  // Convert the value to a string using the user's locale
  const valueString = value.toLocaleString()

  // Find the position of the decimal point
  const decimalPosition = valueString.indexOf(
    value.toLocaleString(undefined, { minimumFractionDigits: 1 }),
  )

  // If there is no decimal point or the decimals are less than the max, return maxDecimals
  if (
    decimalPosition === -1 ||
    valueString.length - decimalPosition - 1 <= maxDecimals
  ) {
    return maxDecimals
  }

  // Find the last non-zero digit position after the decimal point
  let lastNonZeroDigit = decimalPosition + maxDecimals + 1
  while (
    lastNonZeroDigit > decimalPosition &&
    valueString[lastNonZeroDigit] === "0"
  ) {
    lastNonZeroDigit--
  }

  // Calculate the number of decimals to show
  const decimalsToShow = Math.min(
    lastNonZeroDigit - decimalPosition,
    maxDecimals,
  )

  // Determine the number of decimals based on the size of the number
  const sizeOfNumber = Math.floor(Math.log10(Math.abs(Number(value)))) + 1
  const decimalsBasedOnSize = Math.max(0, maxDecimals - sizeOfNumber)

  return Math.min(decimalsToShow, decimalsBasedOnSize)
}

export function determinePriceDecimalsFromToken(
  value: number | bigint | undefined,
  token?: Token,
) {
  return determineDecimals(value, token?.priceDisplayDecimals)
}

export function getSeparator() {
  return Intl.NumberFormat("en-US")
    .formatToParts(123.4)
    .find?.((x) => x.type === "decimal")?.value
}

export function calculatePriceDifferencePercentage({
  price,
  value,
}: {
  price?: number | null
  value: number
}) {
  return price ? ((value - price) / price) * 100 : 0
}

export function calculatePriceFromPercentage({
  percentage,
  basePrice,
}: {
  percentage: number
  basePrice: number
}) {
  return (percentage / 100) * basePrice + basePrice
}

// export function formatNumber(num: number, locale = "en-US", currency = "USD") {
//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//     maximumFractionDigits: 0,
//   }).format(num)
// }
