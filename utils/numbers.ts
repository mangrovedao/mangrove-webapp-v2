"use client"

import type { Token } from "@mangrovedao/mgv"
import getUserLocale from "get-user-locale"

/**
 * Formats a number using the user's locale settings
 * @param value The number to format
 * @param options Optional Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | bigint | null,
  options?: Intl.NumberFormatOptions | undefined,
) {
  return Intl.NumberFormat(getUserLocale(), {
    ...options,
  }).format(value ?? 0)
}

/**
 * Determines the appropriate number of decimal places to show based on the value
 * Analyzes the number to find significant digits and adjusts based on number size
 * @param value The number to analyze
 * @param maxDecimals Maximum number of decimals to show (default: 6)
 * @returns Number of decimal places to display
 */
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

/**
 * Gets the appropriate number of decimals for a price value based on token settings
 * @param value The price value to determine decimals for
 * @param token Optional token that may have price display settings
 * @returns Number of decimal places to display
 */
export function determinePriceDecimalsFromToken(
  value: number | bigint | undefined,
  token?: Token,
) {
  return determineDecimals(value, token?.priceDisplayDecimals)
}

/**
 * Gets the decimal separator character based on the user's locale
 * @returns The decimal separator character (e.g., "." for US English)
 */
export function getSeparator() {
  return Intl.NumberFormat("en-US")
    .formatToParts(123.4)
    .find?.((x) => x.type === "decimal")?.value
}

/**
 * Calculates the percentage difference between a price and a value
 * @param price Reference price to compare against
 * @param value Current value to compare
 * @returns Percentage difference (positive if value > price)
 */
export function calculatePriceDifferencePercentage({
  price,
  value,
}: {
  price?: number | null
  value: number
}) {
  return price ? ((value - price) / price) * 100 : 0
}

/**
 * Calculates a price based on a percentage change from a base price
 * @param percentage Percentage change to apply
 * @param basePrice Base price to modify
 * @returns New price after applying percentage change
 */
export function calculatePriceFromPercentage({
  percentage,
  basePrice,
}: {
  percentage: number
  basePrice: number
}) {
  return (percentage / 100) * basePrice + basePrice
}

/**
 * Determines appropriate decimal precision for displaying price values
 * Smaller values get more decimals, larger values get fewer
 * @param value The price value to determine decimals for
 * @param tokenDecimals Optional token-specific display decimals to consider
 * @returns The appropriate number of decimals to display
 */
export function getAppropriateDecimals(
  value: number,
  tokenDecimals?: number,
): number {
  // Base decimals determined by value magnitude
  let appropriateDecimals = 6 // Default

  // Adjust based on price magnitude - smaller prices need more precision
  if (value < 0.0001) appropriateDecimals = 8
  else if (value < 0.001) appropriateDecimals = 6
  else if (value < 0.1) appropriateDecimals = 5
  else if (value < 1) appropriateDecimals = 4
  else if (value < 100) appropriateDecimals = 3
  else if (value < 1000) appropriateDecimals = 0
  else appropriateDecimals = 0 // For very large prices

  // If token has specific display preference, consider it
  if (tokenDecimals !== undefined) {
    // Use the smaller of token's preference or our calculated value
    appropriateDecimals = Math.min(tokenDecimals, appropriateDecimals)
  }

  return appropriateDecimals
}

/**
 * Formats a price value with appropriate decimals based on magnitude
 * @param value The price value to format
 * @param token Optional token to get display preferences from
 * @param options Additional formatting options
 * @returns Formatted price string
 */
export function formatPriceWithAppropriateDecimals(
  value: number,
  token?: {
    symbol?: string
    priceDisplayDecimals?: number
  },
  options?: {
    includeSymbol?: boolean
    minimumFractionDigits?: number
  },
): string {
  if (value === undefined || isNaN(value)) return "-"

  const appropriateDecimals = getAppropriateDecimals(
    value,
    token?.priceDisplayDecimals,
  )

  const minDecimals =
    options?.minimumFractionDigits ?? Math.min(2, appropriateDecimals)

  const isUSD = token?.symbol?.includes("USD")

  return `${isUSD ? "$" : ""}${formatNumber(value, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: appropriateDecimals,
  })} ${isUSD ? "" : token?.symbol}`
}

// export function formatNumber(num: number, locale = "en-US", currency = "USD") {
//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//     maximumFractionDigits: 0,
//   }).format(num)
// }
