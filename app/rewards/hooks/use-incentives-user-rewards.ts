import { useVaultWhiteList } from "@/app/earn/(shared)/_hooks/use-vault-whitelist"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { userIncentiveResponseSchema } from "../schemas/rewards-configuration"

export const useIncentivesUserRewards = () => {
  const { address: user } = useAccount()
  const { data: vaults } = useVaultWhiteList()
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["incentives-user-rewards", vaults, defaultChain.id, user],
    queryFn: async () => {
      try {
        if (!user) return null
        const userIncentives = await Promise.all(
          vaults?.map((vault) =>
            fetch(
              `${getIndexerUrl(defaultChain)}/incentives/vaults/${defaultChain.id}/${vault.address}/${user}?startTimestamp=${vault.incentives?.[0]?.startTimestamp}&endTimestamp=${vault.incentives?.[0]?.endTimestamp}&rewardRate=${vault.incentives?.[0]?.rewardRatePerSecond}&maxRewards=${vault.incentives?.[0]?.maxRewards}`,
            ),
          ) ?? [],
        )

        if (userIncentives?.some((incentive) => !incentive)) {
          throw new Error("Failed to fetch incentives rewards")
        }

        const incentivesData = await Promise.all(
          userIncentives.map(async (incentive) =>
            userIncentiveResponseSchema.parse(await incentive),
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
