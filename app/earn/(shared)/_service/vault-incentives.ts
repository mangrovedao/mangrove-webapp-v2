import { z } from "zod"

import { vaultIncentivesSchema } from "@/app/rewards/schemas/rewards-configuration"
import { PublicClient } from "viem/_types/clients/createPublicClient"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"

/**
 * Calculates the total APR for a vault, including AAVE yields, trading fees, and incentives
 * @param client - Web3 client for blockchain interaction
 * @param vault - Address of the vault contract
 * @returns Total calculated APR as a number, or 0 if calculation fails
 */
export async function getVaultIncentives(
  client: PublicClient,
  incentives?: VaultLPProgram,
): Promise<z.infer<typeof vaultIncentivesSchema> | null> {
  try {
    if (!incentives) return null

    const userIncentives = await fetch(
      `https://indexer.mgvinfra.com/incentives/vaults/${client.chain?.id}/${incentives?.vault}?startTimestamp=${incentives?.startTimestamp}&endTimestamp=${incentives?.endTimestamp}&rewardRate=${incentives?.rewardRate}&maxRewards=${incentives?.maxRewards}&page=0&pageSize=100`,
    )

    if (!userIncentives?.ok) {
      throw new Error("Failed to fetch incentives rewards")
    }

    const incentivesData = vaultIncentivesSchema.parse(
      await userIncentives.json(),
    )

    return incentivesData
  } catch (error) {
    console.error(error)
    return null
  }
}
