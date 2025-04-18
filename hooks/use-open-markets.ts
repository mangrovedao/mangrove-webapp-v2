import { printEvmError } from "@/utils/errors"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { MarketParams, Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { z } from "zod"
import { useCashnesses, useSymbolOverrides } from "./use-addresses"

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
        displayDecimals: token.decimals,
        priceDisplayDecimals: token.decimals,
        mgvTestToken: false,
      }) as Token,
  )

const MarketSchema = z
  .object({
    base: TokenSchema,
    quote: TokenSchema,
    bidsOlKeyHash: z.string(),
    asksOlKeyHash: z.string(),
    tickSpacing: z.number().transform((val) => BigInt(val)),
  })
  .transform((market) => market as MarketParams)

const OpenMarketsResponseSchema = z.object({
  tokens: z.array(TokenSchema),
  markets: z.array(MarketSchema),
})

export function useOpenMarkets() {
  const { defaultChain } = useDefaultChain()
  const cashnesses = useCashnesses()
  const symbolOverride = useSymbolOverrides()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-markets", defaultChain.id, cashnesses, symbolOverride],
    queryFn: async () => {
      try {
        if (!defaultChain.id) throw new Error("Chain ID not found")

        const response = await fetch(
          `${getIndexerUrl(defaultChain)}/markets/open/${defaultChain.id}`,
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
        return OpenMarketsResponseSchema.parse(await response.json())
      } catch (error) {
        console.error("Error fetching open markets:", error)
        printEvmError(error)
        return { tokens: [], markets: [] }
      }
    },
    enabled: !!defaultChain.id,
    retry: 1,
  })

  return {
    openMarkets: data?.markets || [],
    tokens: data?.tokens || [],
    isLoading,
    isError,
  }
}
