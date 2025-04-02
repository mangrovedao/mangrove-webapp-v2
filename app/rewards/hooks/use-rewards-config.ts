import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { configurationSchema } from "../schemas/rewards-configuration"

export const useConfiguration = () => {
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["rewards-configuration", defaultChain.id],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://points.mgvinfra.com/configuration",
        )
        if (!response.ok) {
          throw new Error("Failed to fetch configuration")
        }

        const epochs = configurationSchema.parse(await response.json()).chains[
          defaultChain.id
        ]

        if (!epochs) {
          throw new Error("No epochs found")
        }

        const now = Math.floor(Date.now() / 1000)
        const epochEntries = Object.entries(epochs.rewardsLimit).map(
          ([epochId, data]) => ({
            epochId: Number(epochId),
            startTimestamp: Number(data.startTimestamp.replace("n", "")),
            budget: data.budget,
          }),
        )

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
        const endDate = new Date(1738062000 * 1000)

        const nextEpochEntry = epochEntries.find((entry) => {
          return entry.startTimestamp > now && entry.startTimestamp !== 0
        })

        const nextEpochStart = nextEpochEntry
          ? new Date(nextEpochEntry.startTimestamp * 1000)
          : null

        const nextEpochTime = new Date(nextEpochStart ?? 0).getTime()
        const timeLeft = nextEpochTime - Date.now()

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        )
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

        const timeRemaining = `${days} d: ${hours} h: ${minutes} m`

        return {
          nextEpoch: nextEpochStart,
          epochId: epochId,
          timeRemaining,
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
