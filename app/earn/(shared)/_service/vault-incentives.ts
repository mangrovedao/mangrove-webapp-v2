import { z } from "zod"

import { vaultIncentivesSchema } from "@/app/rewards/schemas/rewards-configuration"
import { useIndexerUrl } from "@/utils/get-indexer-url"
import { Address } from "viem"
import { PublicClient } from "viem/_types/clients/createPublicClient"
import { VaultIncentive } from "../types"

/**
 * Calculates the total APR for a vault, including AAVE yields, trading fees, and incentives
 * @param client - Web3 client for blockchain interaction
 * @param vault - Address of the vault contract
 * @returns Total calculated APR as a number, or 0 if calculation fails
 */
export async function getVaultIncentives(
  client: PublicClient,
  vaultAddress: Address,
  incentives?: VaultIncentive,
): Promise<z.infer<typeof vaultIncentivesSchema> | null> {
  try {
    if (!incentives) return null

    const indexerUrl = useIndexerUrl()
    const userIncentives = await fetch(
      `${indexerUrl}/incentives/vaults/${client.chain?.id}/${vaultAddress}?startTimestamp=${incentives?.startTimestamp}&endTimestamp=${incentives?.endTimestamp}&rewardRate=${incentives?.rewardRate}&maxRewards=${incentives?.maxRewards}&page=0&pageSize=100`,
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
