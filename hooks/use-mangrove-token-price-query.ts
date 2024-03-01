import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { useAccount, useChainId } from "wagmi"

const tokenSchema = z.object({
  takerSentTokenSymbol: z.string(),
  takerReceivedTokenSymbol: z.string(),
  outboundTkn: z.string(),
  inboundTkn: z.string(),
  takerGot: z.string(),
  takerGave: z.string(),
  minPrice: z.string(),
  maxPrice: z.string(),
  diffTakerGave: z.number(),
  diffTakerGot: z.number(),
})

const mangrovePriceSchema = z.record(tokenSchema)

// useTokenPrice query from Mangrove data
const useMangroveTokenPricesQuery = (
  baseAddress?: string,
  quoteAddress?: string,
) => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  return useQuery({
    queryKey: ["mangroveTokenPrice", baseAddress, quoteAddress, chainId],
    queryFn: async () => {
      if (!baseAddress || !quoteAddress || !chainId) return undefined
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BLAST_DATA_SERVICE}/${baseAddress}/${quoteAddress}`,
      )
      const mangroveTokenPrices = await res.json()
      return mangrovePriceSchema.parse(mangroveTokenPrices)
    },
    enabled: !!baseAddress && !!quoteAddress && isConnected && !!chainId,
    refetchInterval: 1000 * 60, // every minute
    staleTime: 1000 * 60, // 1 minute for 1m interval
  })
}

export default useMangroveTokenPricesQuery
