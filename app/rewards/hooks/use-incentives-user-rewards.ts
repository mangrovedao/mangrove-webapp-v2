import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { incentiveResponseSchema } from "../schemas/rewards-configuration"

export const useIncentivesUserRewards = () => {
  const { address: user } = useAccount()
  const vaultsIncentives = useVaultsIncentives()
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: [
      "incentives-user-rewards",
      vaultsIncentives,
      defaultChain.id,
      user,
    ],
    queryFn: async () => {
      try {
        if (!user) return null
        const userIncentives = await Promise.all(
          vaultsIncentives.map((incentive) =>
            fetch(
              `${process.env.NEXT_PUBLIC_INDEXER_URL}/incentives/vaults/${defaultChain.id}/${incentive.vault}/${user}?startTimestamp=${incentive.startTimestamp}&endTimestamp=${incentive.endTimestamp}&rewardRate=${incentive.rewardRate}&maxRewards=${incentive.maxRewards}`,
            ),
          ),
        )

        if (userIncentives?.some((incentive) => !incentive.ok)) {
          throw new Error("Failed to fetch incentives rewards")
        }

        const incentivesData = await Promise.all(
          userIncentives.map(async (incentive) =>
            incentiveResponseSchema.parse(await incentive.json()),
          ),
        )

        return incentivesData.reduce((acc, curr) => acc + curr.rewards, 0)
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
}
