import { Address, PublicClient } from "viem"
import { z } from "zod"

import { incentiveResponseSchema } from "@/app/rewards/schemas/rewards-configuration"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"

/**
 * Calculates the total APR for a vault, including AAVE yields, trading fees, and incentives
 * @param client - Web3 client for blockchain interaction
 * @param vault - Address of the vault contract
 * @returns Total calculated APR as a number, or 0 if calculation fails
 */
export async function getUserVaultIncentives(
  client: PublicClient,
  user?: Address,
  incentives?: VaultLPProgram,
): Promise<z.infer<typeof incentiveResponseSchema> | null> {
  try {
    if (!user || !incentives) return null

    const userIncentives = await fetch(
      `${process.env.NEXT_PUBLIC_INDEXER_URL}/incentives/vaults/${client.chain?.id}/${incentives?.vault}/${user}?startTimestamp=${incentives?.startTimestamp}&endTimestamp=${incentives?.endTimestamp}&rewardRate=${incentives?.rewardRate}&maxRewards=${incentives?.maxRewards}`,
    )

    if (!userIncentives?.ok) {
      throw new Error("Failed to fetch incentives rewards")
    }

    const incentivesData = incentiveResponseSchema.parse(
      await userIncentives.json(),
    )

    return incentivesData
  } catch (error) {
    console.error(error)
    return null
  }
}
