import { env } from "@/env.mjs"
import {
  convertToMangroveApiResponse,
  cryptoComparePriceResponseSchema,
} from "@/schemas/cryptocompare-price-api"
import { mangrovePriceResponseSchema } from "@/schemas/mangrove-price-api"
import { getErrorMessage } from "@/utils/errors"

export async function getTokenPriceInUsd(tokenSymbol: string) {
  return getTokenPriceInToken(tokenSymbol, "USD")
}

export async function getTokenPriceInToken(
  tokenSymbol: string,
  priceTokenSymbol: string,
  interval: "1m" | "1d" = "1m",
) {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_PRICE_API_URL}prices/${tokenSymbol}/${priceTokenSymbol}/${interval}`,
    )

    if (response.ok) {
      const candleJson = await response.json()
      return mangrovePriceResponseSchema.parse(candleJson)
    } else {
      // if there's an error with the first API call, fall back to the second URI
      const fallbackResponse = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=${priceTokenSymbol}`,
      )
      if (fallbackResponse.ok) {
        const fallbackJson = await fallbackResponse.json()
        const fallback = cryptoComparePriceResponseSchema.parse(fallbackJson)
        return convertToMangroveApiResponse(fallback)
      } else {
        throw new Error(
          `PRICE API requests failed: ${await fallbackResponse.text()}`,
        )
      }
    }
  } catch (e) {
    throw new Error(`Failed to get token price: ${getErrorMessage(e)}`)
  }
}
