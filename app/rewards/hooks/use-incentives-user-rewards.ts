import { useVaultsList } from "@/app/earn/(shared)/_hooks/use-vaults-list"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { incentiveResponseSchema } from "../schemas/rewards-configuration"

export const useIncentivesUserRewards = () => {
  const { address: user } = useAccount()
  const { data: vaults } = useVaultsList()
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["incentives-user-rewards", vaults, defaultChain.id, user],
    queryFn: async () => {
      try {
        if (!user) return null
        const userIncentives = await Promise.all(
          vaults?.map((vault) =>
            fetch(
              `${getIndexerUrl(defaultChain)}/incentives/vaults/${defaultChain.id}/${vault.incentives?.vault}/${user}?startTimestamp=${vault.incentives?.startTimestamp}&endTimestamp=${vault.incentives?.endTimestamp}&rewardRate=${vault.incentives?.rewardRate}&maxRewards=${vault.incentives?.maxRewards}`,
            ),
          ) ?? [],
        )

        if (userIncentives?.some((incentive) => !incentive)) {
          throw new Error("Failed to fetch incentives rewards")
        }

        const incentivesData = await Promise.all(
          userIncentives.map(async (incentive) =>
            incentiveResponseSchema.parse(await incentive),
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
