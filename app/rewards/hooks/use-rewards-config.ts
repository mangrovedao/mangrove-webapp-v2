import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { configurationSchema } from "../schemas/rewards-configuration"

export const useConfiguration = () => {
  const { chain } = useAccount()
  return useQuery({
    queryKey: ["rewards-configuration", chain?.id],
    enabled: !!chain?.id,
    queryFn: async () => {
      try {
        if (!chain?.id) {
          throw new Error("No chain found")
        }
        const response = await fetch(
          "https://points.mgvinfra.com/configuration",
        )
        if (!response.ok) {
          throw new Error("Failed to fetch configuration")
        }

        const epochs = configurationSchema.parse(await response.json()).chains[
          chain.id
        ]

        if (!epochs) {
          throw new Error("No epochs found")
        }

        const epochId = Object.keys(epochs?.rewardsLimit ?? {})[0]

        return {
          epochId: epochId,
          totalBudget: epochs.rewardsLimit,
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
