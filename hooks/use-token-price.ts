import { arbitrum } from "viem/chains"
import { z } from "zod"

const priceSchema = z.object({
  price: z.number(),
})

export async function getTokenPrice(tokenAddress?: string, chainId?: number) {
  try {
    if (!tokenAddress) return 0

    const response = await fetch(
      `https://price.mgvinfra.com/price-by-address?chain=${chainId ?? arbitrum.id}&address=${tokenAddress}`,
    )
    const data = await response.json()
    const parsed = priceSchema.parse(data)
    return parsed.price
  } catch (error) {
    console.error("Failed to fetch token price", error)
    return 0
  }
}
