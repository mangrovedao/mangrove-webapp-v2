import { z } from "zod"
import {
  mangrovePriceResponseSchema,
  type MangrovePriceResponse,
} from "./mangrove-price-api"

export const cryptoComparePriceResponseSchema = z.record(z.number())

export type CryptoComparePriceResponse = z.infer<
  typeof cryptoComparePriceResponseSchema
>

export function convertToMangroveApiResponse(
  response: Record<string, number>,
): MangrovePriceResponse {
  const tokenName = Object.keys(response)[0]
  if (!tokenName) throw new Error("Invalid response from CryptoCompare API")
  return mangrovePriceResponseSchema.parse({
    open: response[tokenName],
    high: response[tokenName],
    low: response[tokenName],
    close: response[tokenName],
    volume: 0,
    date: new Date().toISOString(),
  })
}
