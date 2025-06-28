import { useQuery } from "@tanstack/react-query"
import { Address, erc20Abi, formatUnits, parseAbi } from "viem"
import { useAccount } from "wagmi"
import { z } from "zod"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"

const RewardProofSchema = z.object({
  account: z.string().transform((val) => val as Address),
  token: z.string().transform((val) => val as Address),
  amount: z.string(),
  proof: z.array(z.string()),
})

const RewardsResponseSchema = z.array(RewardProofSchema)

const rewardsAbi = parseAbi([
  "function claimed(address account, address reward) view returns (uint256 amount)",
])

const rewardDistributorAddress = "0xDb6A3A20743f5878732EF73623a51033c80DBB10"

export function useRewardsInfo({ rewardToken }: { rewardToken?: Address }) {
  const { defaultChain } = useDefaultChain()
  const { address } = useAccount()
  const client = useNetworkClient()

  return useQuery({
    queryKey: ["rewards-proofs", address, defaultChain.id, rewardToken],
    queryFn: async () => {
      try {
        if (!address || !rewardToken) return null

        const response = await fetch(
          `https://api.mgvinfra.com/merkle/proofs/${address}`,
        )
        const data = await response.json()

        const rewards = RewardsResponseSchema.parse(data)[0]

        const multicallResult = await client.multicall({
          contracts: [
            {
              address: rewardDistributorAddress,
              abi: rewardsAbi,
              functionName: "claimed",
              args: [address, rewardToken],
            },
            {
              address: rewardToken,
              abi: erc20Abi,
              functionName: "decimals",
            },
            {
              address: rewardToken,
              abi: erc20Abi,
              functionName: "symbol",
            },
          ],
        })

        const [claimed, decimals, symbol] = multicallResult.map((result) => {
          if (result.status === "success") {
            return result.result
          }
          return null
        })

        const totalRewards = formatUnits(
          BigInt(rewards?.amount || 0),
          Number(decimals),
        )
        const totalRewardsRaw = BigInt(rewards?.amount || 0)
        const claimedRaw = BigInt(claimed || 0)
        const claimableRaw = totalRewardsRaw - claimedRaw
        const claimable = Number(formatUnits(claimableRaw, Number(decimals)))

        return {
          rewards,
          claimable,
          claimed,
          totalRewards,
          symbol,
          decimals,
        }
      } catch (error) {
        printEvmError(error)
        return null
      }
    },
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
