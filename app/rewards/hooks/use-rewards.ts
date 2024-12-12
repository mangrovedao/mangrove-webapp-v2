import { useQuery } from "@tanstack/react-query"
import { zeroAddress } from "viem"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { rewardsSchema } from "../schemas/rewards-configuration"

type UseRewardsProps = {
  epochId?: string
}

export const useRewards = ({ epochId = "1" }: UseRewardsProps) => {
  const { address, chain } = useAccount()

  return useQuery({
    queryKey: ["rewards", address, chain?.id, epochId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://points.mgvinfra.com/rewards?epoch=${epochId}&chainId=${chain?.id ?? arbitrum.id}&user=${address ?? zeroAddress}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch rewards")
        }

        const data = await response.json()
        return rewardsSchema.parse(data)
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
}
