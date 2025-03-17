import { useQuery } from "@tanstack/react-query"
import { zeroAddress } from "viem"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useAccount } from "wagmi"
import { rewardsSchema } from "../schemas/rewards-configuration"

type UseRewardsProps = {
  epochId?: string
}

export const useRewards = ({ epochId = "1" }: UseRewardsProps) => {
  const { address } = useAccount()
  const defaultChain = useDefaultChain()

  return useQuery({
    queryKey: ["rewards", address, defaultChain.id, epochId],
    queryFn: async () => {
      try {
        if (!address) return null
        const response = await fetch(
          `https://points.mgvinfra.com/${defaultChain.id}/${address ?? zeroAddress}/rewards?epoch=${epochId}`,
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
