import { AddressSchema } from "@/utils/schema"
import { useQuery } from "@tanstack/react-query"
import { useChainId } from "wagmi"
import { z } from "zod/v4"

// Token schema with display decimals
const tokenSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  address: AddressSchema,
  symbol: z.string(),
  decimals: z.number(),
  displayDecimals: z.number(),
  priceDisplayDecimals: z.number(),
})

// Market schema
const marketSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  base: tokenSchema,
  quote: tokenSchema,
  tickSpacing: z.number(),
})

// Socials schema
const socialsSchema = z.object({
  x: z.string().optional(),
  website: z.string().optional(),
})

// Incentive schema
const incentiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  chainId: z.number(),
  startTimestamp: z.number(),
  endTimestamp: z.number(),
  maxRewards: z.number(),
  rewardRatePerSecond: z.number(),
  token: z.string(),
  tokenAddress: AddressSchema,
  apy: z.number(),
  stakedTokenPrice: z.number(),
  rewardTokenPrice: z.number(),
})

// Main vault schema
const vaultSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  manager: z.string(),
  address: AddressSchema,
  strategyType: z.string(),
  description: z.string(),
  descriptionBonus: z.string(),
  isDeprecated: z.boolean(),
  socials: socialsSchema,
  market: marketSchema,
  incentives: z.array(incentiveSchema),
  oracle: AddressSchema.optional(),
})

// Array of vaults schema
const vaultWhitelistSchema = z.array(vaultSchema)

export type Token = z.infer<typeof tokenSchema>
export type Market = z.infer<typeof marketSchema>
export type Socials = z.infer<typeof socialsSchema>
export type Incentive = z.infer<typeof incentiveSchema>
export type Vault = z.infer<typeof vaultSchema>
export type VaultWhitelist = z.infer<typeof vaultWhitelistSchema>

export function useVaultWhiteList() {
  const chainId = useChainId()
  return useQuery({
    queryKey: ["vault-whitelist", chainId],
    queryFn: async () => {
      const url = new URL("https://api.mgvinfra.com/registry/whitelist")
      url.searchParams.set("chainId", chainId.toString())
      const response = await fetch(url)
      const data = await response.json()
      return vaultWhitelistSchema.parse(data)
    },
  })
}
