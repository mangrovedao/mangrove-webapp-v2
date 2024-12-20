import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { useQuery } from "@tanstack/react-query"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { incentiveResponseSchema } from "../../../rewards/schemas/rewards-configuration"

export const useIncentivesRewards = () => {
  const { address, chain } = useAccount()
  const vaultsIncentives = useVaultsIncentives()
  const defaultChainId = chain?.id ?? arbitrum.id

  return useQuery({
    queryKey: ["user-incentives-rewards", address, vaultsIncentives, chain?.id],
    queryFn: async () => {
      try {
        if (!address) return null

        const userIncentives = await Promise.all(
          vaultsIncentives.map((incentive) =>
            fetch(
              `https://${defaultChainId}-mgv-data.mgvinfra.com/incentives/vaults/${defaultChainId}/${incentive.vault}/${address}?startTimestamp=${incentive.startTimestamp}&endTimestamp=${incentive.endTimestamp}&rewardRate=${incentive.rewardRate}&maxRewards=${incentive.maxRewards}`,
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
