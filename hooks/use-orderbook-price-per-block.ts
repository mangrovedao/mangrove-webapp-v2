import { useQuery } from "@tanstack/react-query"
import { useBlockNumber } from "wagmi"
import { z } from "zod"

import { env } from "@/env.mjs"

const entrySchema = z.object({
  block_number: z.number(),
  min_ask: z.string(),
  max_bid: z.string(),
  mid_price: z.coerce.number(),
  usdb: z.object({
    block_number: z.number(),
    min_ask: z.union([z.string(), z.number()]),
    max_bid: z.union([z.string(), z.number()]),
    mid_price: z.coerce.number(),
  }),
})

const schema = z.record(z.array(entrySchema))

type OrderbookPricePerBlock = z.infer<typeof schema>

function transformData(data: OrderbookPricePerBlock) {
  const result: { [key: string]: number } = {} // Add index signature to result object

  for (const [key, value] of Object.entries(data)) {
    const [baseAddress, quoteAddress] = key.split("-")
    const bMidPriceInQuote = value?.[0]?.mid_price
    const bMidPriceInUsdb = value?.[0]?.usdb.mid_price
    if (!bMidPriceInQuote || !bMidPriceInUsdb || !baseAddress || !quoteAddress)
      return undefined
    result[baseAddress] = bMidPriceInUsdb
    result[quoteAddress] = bMidPriceInQuote / bMidPriceInUsdb
  }

  return result
}

export async function fetchOrderbookPricePerBlock(blockStr: string) {
  const response = await fetch(`
  ${env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/order-book/price-per-block-full/all/${blockStr}/${blockStr}`)
  const result = await response.json()
  const lowercasedResult = Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key.toLowerCase(), value]),
  )
  return schema.parse(lowercasedResult)
}

export function useOrderbookPricePerBlock() {
  const { data: block } = useBlockNumber()
  const blockStr = block?.toString()

  return useQuery({
    queryKey: ["orderbook-price-per-block", blockStr],
    queryFn: async () => {
      if (!blockStr) return null
      return fetchOrderbookPricePerBlock(blockStr)
    },
    refetchInterval: 30000,
    enabled: !!blockStr,
  })
}

export function useTokenPricesInUsb() {
  const { data: block } = useBlockNumber()
  const blockStr = block?.toString()

  return useQuery({
    queryKey: ["token-usdb-prices", blockStr],
    queryFn: async () => {
      try {
        if (!blockStr) return null
        const res = await fetchOrderbookPricePerBlock(blockStr)
        return transformData(res)
      } catch (error) {
        return null
      }
    },
    enabled: !!blockStr,
  })
}

export function useOrderBookPrice(baseAddress?: string, quoteAddress?: string) {
  const { data } = useOrderbookPricePerBlock()
  if (!(baseAddress && quoteAddress && data)) return undefined
  return data[baseAddress + "-" + quoteAddress]?.[0]
}
