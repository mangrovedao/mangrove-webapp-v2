import { printEvmError } from "@/utils/errors"

import { useIndexerUrl } from "@/utils/get-indexer-url"
import { applyPriceDisplayDecimals } from "@/utils/tokens"
import { MarketParams, Token, mangroveActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { useChainId } from "wagmi"
import { z } from "zod"
import {
  useCashnesses,
  useMangroveAddresses,
  useSymbolOverrides,
} from "./use-addresses"
import { useNetworkClient } from "./use-network-client"

// Define Zod schemas that match the expected Mangrove types
const TokenSchema = z
  .object({
    address: z.string().transform((val) => val as Address),
    symbol: z.string(),
    decimals: z.number(),
  })
  .transform(
    (token) =>
      ({
        ...token,
        displayDecimals: token.decimals === 18 ? 6 : token.decimals,
        priceDisplayDecimals: token.decimals === 18 ? 6 : token.decimals,
        mgvTestToken: false,
      }) as Token,
  )

const MarketSchema = z
  .object({
    base: TokenSchema,
    quote: TokenSchema,
    bidsOlKeyHash: z.string().optional(),
    asksOlKeyHash: z.string().optional(),
    tickSpacing: z.number().transform((val) => BigInt(val)),
  })
  .transform((market) => market as MarketParams)

const OpenMarketsResponseSchema = z.object({
  tokens: z.array(TokenSchema),
  markets: z.array(MarketSchema),
})

export function useOpenMarkets() {
  const chainId = useChainId()
  const cashnesses = useCashnesses()
  const symbolOverride = useSymbolOverrides()
  const client = useNetworkClient()
  const mangrove = useMangroveAddresses()
  const indexerUrl = useIndexerUrl()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-markets", chainId, cashnesses, symbolOverride, indexerUrl],
    queryFn: async () => {
      try {
        if (!chainId) throw new Error("Chain ID not found")

        // Try API first
        try {
          const response = await fetch(
            `${indexerUrl}/markets/open/${chainId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cashnesses,
                overrides: symbolOverride,
              }),
            },
          )

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }

          // Parse and validate in one step
          const apiResponse = OpenMarketsResponseSchema.parse(
            await response.json(),
          )

          return apiResponse
        } catch (apiError) {
          console.log("apiError", apiError)
          console.error("API fetch failed, falling back to SDK:", apiError)

          // Fallback to SDK
          if (!mangrove || !client) {
            throw new Error("Mangrove client not available for fallback")
          }

          const markets = await client
            .extend(mangroveActions(mangrove))
            .getOpenMarkets({
              cashnesses: Object.fromEntries(
                Object.entries(cashnesses).filter(
                  ([, value]) => value !== undefined,
                ),
              ) as Record<string, number>,
              symbolOverrides: Object.fromEntries(
                Object.entries(symbolOverride).filter(
                  ([, value]) => value !== undefined,
                ),
              ) as Record<string, string>,
            })

          // Convert SDK response to match API response format
          return {
            tokens: markets.reduce<Token[]>((acc, market) => {
              if (
                !acc.some(
                  (t) =>
                    t.address.toLowerCase() ===
                    market.base.address.toLowerCase(),
                )
              ) {
                acc.push(market.base)
              }
              if (
                !acc.some(
                  (t) =>
                    t.address.toLowerCase() ===
                    market.quote.address.toLowerCase(),
                )
              ) {
                acc.push(market.quote)
              }
              return acc
            }, []),
            markets,
          }
        }
      } catch (error) {
        console.error("Error fetching open markets:", error)
        printEvmError(error)
        return { tokens: [], markets: [] }
      }
    },
    enabled: !!chainId,
    retry: 1,
  })
  return {
    openMarkets: applyPriceDisplayDecimals(data?.markets) || [],
    tokens: data?.tokens || [],
    isLoading,
    isError,
  }
}
