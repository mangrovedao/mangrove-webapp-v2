import { formatPriceWithAppropriateDecimals } from "@/utils/numbers"
import type { Token } from "@mangrovedao/mgv"
import { useEffect } from "react"

/**
 * Hook to update the browser tab title with token price information
 * @param options Configuration options for the title display
 * @returns Nothing, modifies document.title directly
 */
export function useUpdatePageTitle({
  spotPrice,
  baseToken,
  quoteToken,
  suffix = "Mangrove DEX",
  prefix,
}: {
  spotPrice?: number | null
  baseToken?: Token | null
  quoteToken?: Token | null
  suffix?: string
  prefix?: string
}) {
  useEffect(() => {
    // Default title when tokens not set or no valid price
    let newTitle = suffix

    // Construct the pair symbol if both tokens available
    const pairSymbol =
      baseToken && quoteToken ? `${baseToken.symbol}/${quoteToken.symbol}` : ""

    // Use spot price first if available
    if (baseToken && quoteToken && spotPrice && spotPrice > 0) {
      const formattedPrice = formatPriceWithAppropriateDecimals(
        spotPrice,
        baseToken,
        { includeSymbol: !!baseToken.symbol },
      )

      newTitle = `${formattedPrice} | ${pairSymbol} | ${suffix}`
    }

    // Add prefix if provided
    if (prefix) {
      newTitle = `${prefix} | ${newTitle}`
    }

    // Update the document title
    document.title = newTitle
  }, [spotPrice, baseToken, quoteToken, suffix, prefix])
}
