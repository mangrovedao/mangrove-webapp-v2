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

        // Find current epoch by checking if current time is within its timeframe
        const currentEpochEntry = epochEntries.find((entry) => {
          const epochStart = Number(entry[1].startTimestamp.replace("n", ""))
          if (epochStart === 0) return false
          const nextEpoch = epochEntries.find(
            (e) => Number(e[1].startTimestamp.replace("n", "")) > epochStart,
          )
          const epochEnd = nextEpoch
            ? Number(nextEpoch[1].startTimestamp.replace("n", ""))
            : Infinity
          return now >= epochStart && now < epochEnd
        })

        const epochId = currentEpochEntry?.[0] ?? null

        const nextEpochStart = epochEntries.find((entry) => {
          const startTimestamp = Number(
            entry[1].startTimestamp.replace("n", ""),
          )
          return startTimestamp > now && startTimestamp !== 0
        })?.[1].startTimestamp
          ? new Date(
              Number(
                epochEntries
                  .find((entry) => {
                    const startTimestamp = Number(
                      entry[1].startTimestamp.replace("n", ""),
                    )
                    return startTimestamp > now && startTimestamp !== 0
                  })?.[1]
                  ?.startTimestamp.replace("n", ""),
              ) * 1000,
            )
          : null

        return {
          nextEpoch: nextEpochStart,
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
