import { useQuery } from "@tanstack/react-query"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { configurationSchema } from "../schemas/rewards-configuration"

export const useConfiguration = () => {
  const { chain } = useAccount()

  const chainId = chain?.id ?? arbitrum.id

  return useQuery({
    queryKey: ["rewards-configuration", chainId],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://points.mgvinfra.com/configuration",
        )
        if (!response.ok) {
          throw new Error("Failed to fetch configuration")
        }

        const epochs = configurationSchema.parse(await response.json()).chains[
          chainId
        ]

        if (!epochs) {
          throw new Error("No epochs found")
        }

        const epochId = Object.keys(epochs.rewardsLimit)[0]

        return {
          epochId: epochId,
          totalBudget: epochs.rewardsLimit[epochId || 0]?.budget,
        }
      } catch (error) {
        console.error(error)
        return {
          epochId: null,
        }
      }
    },
  })
}
