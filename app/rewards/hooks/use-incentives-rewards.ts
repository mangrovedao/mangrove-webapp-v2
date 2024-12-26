import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { useQuery } from "@tanstack/react-query"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { incentiveResponseSchema } from "../schemas/rewards-configuration"

export const useIncentivesRewards = () => {
  const { chain } = useAccount()
  const vaultsIncentives = useVaultsIncentives()
  const defaultChainId = chain?.id ?? arbitrum.id

  return useQuery({
    queryKey: ["incentives-rewards", vaultsIncentives, chain?.id],
    queryFn: async () => {
      try {
        const userIncentives = await Promise.all(
          vaultsIncentives.map((incentive) =>
            fetch(
              `https://${defaultChainId}-mgv-data.mgvinfra.com/incentives/vaults/${defaultChainId}/${incentive.vault}?startTimestamp=${incentive.startTimestamp}&endTimestamp=${incentive.endTimestamp}&rewardRate=${incentive.rewardRate}&maxRewards=${incentive.maxRewards}?pageSize=10`,
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

        return incentivesData
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
}
