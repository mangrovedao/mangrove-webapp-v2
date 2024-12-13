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

        const now = Math.floor(Date.now() / 1000)
        const epochEntries = Object.entries(epochs.rewardsLimit)
          .map(([epochId, data]) => ({
            epochId: Number(epochId),
            startTimestamp: Number(data.startTimestamp.replace("n", "")),
            budget: data.budget,
          }))
          .filter((entry) => entry.startTimestamp !== 0)

        // Find current epoch by checking if current time is within its timeframe
        const currentEpochEntry = epochEntries.find((entry) => {
          const epochStart = entry.startTimestamp
          if (epochStart === 0) return false
          const nextEpoch = epochEntries.find(
            (e) => e.startTimestamp > epochStart,
          )
          const epochEnd = nextEpoch ? nextEpoch.startTimestamp : Infinity
          return now >= epochStart && now < epochEnd
        })

        const epochId = currentEpochEntry?.epochId ?? null

        const nextEpochEntry = epochEntries.find((entry) => {
          return entry.startTimestamp > now && entry.startTimestamp !== 0
        })

        const nextEpochStart = nextEpochEntry
          ? new Date(nextEpochEntry.startTimestamp * 1000)
          : null

        return {
          nextEpoch: nextEpochStart,
          epochId: epochId,
          totalBudget: epochs.rewardsLimit[epochId || 0]?.budget,
          epochEntries,
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
