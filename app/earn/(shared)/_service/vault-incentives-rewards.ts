import { Address, PublicClient } from "viem"
import { z } from "zod"

import { userIncentiveResponseSchema } from "@/app/rewards/schemas/rewards-configuration"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { VaultIncentive } from "../types"
// useVaultsList
// useIncentivesUserRewards
// use claimablerewards
// use getVaultAPR
/**
 * Calculates the total APR for a vault, including AAVE yields, trading fees, and incentives
 * @param client - Web3 client for blockchain interaction
 * @param vault - Address of the vault contract
 * @returns Total calculated APR as a number, or 0 if calculation fails
 */
export async function getUserVaultIncentives(
  client: PublicClient,
  vaultAddress: Address,
  user: Address,
  incentives: VaultIncentive,
): Promise<z.infer<typeof userIncentiveResponseSchema> | null> {
  try {
    if (!user || !incentives) return null

    const userIncentivesResponse = await fetch(
      `${getIndexerUrl(client.chain)}/incentives/vaults/${client.chain?.id}/${vaultAddress}/${user}?startTimestamp=${incentives?.startTimestamp}&endTimestamp=${incentives?.endTimestamp}&rewardRate=${incentives?.rewardRate}&maxRewards=${incentives?.maxRewards}`,
    )

    if (!userIncentivesResponse?.ok) {
      throw new Error("Failed to fetch incentives rewards")
    }

    const userIncentives = userIncentiveResponseSchema.parse(
      await userIncentivesResponse.json(),
    )

    return userIncentives
  } catch (error) {
    console.error(error)
    return null
  }
}
