import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

export const useRewards = () => {
  const { address, chain } = useAccount()

  return useQuery({
    queryKey: ["rewards", address, chain?.id],
    enabled: !!address && !!chain?.id,
    queryFn: async () => {
      try {
        if (!address || !chain?.id) {
          throw new Error("No address or chain found")
        }

        const response = await fetch("https://points.mgvinfra.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(`
            query GetEpochs {
                takerPointsLogs(where: {epoch: 1}) {
                    items {
                    epoch
                    chainId
                    reward
                    points
                    takerAddress
                    }
                }
                makerRewardLogs(where: {epoch: 1}) {
                    items {
                    epoch
                    points
                    reward
                    ownerAddress
                    chainId
                    }
                }
                vaultRewardLogs(where: {epoch: 1}) {
                    items {
                    epoch
                    points
                    reward
                    chainId
                    ownerAddress
                    }
                }
            }
        `),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch rewards")
        }

        const data = await response.json()
        return data.data
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
}
