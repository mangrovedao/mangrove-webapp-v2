import { useAccount } from "wagmi"
import { feesResponseSchema, incentiveResponseSchema } from "../schemas/rewards-configuration"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { useTokens } from "@/hooks/use-addresses"

export const useFeesRewards = () => {
    const { address: user } = useAccount()
    const { defaultChain } = useDefaultChain()
    const tokens = useTokens() 
  
    return useQuery({
      queryKey: ["fees-rewards", defaultChain.id, user],
      queryFn: async () => {
        try {
          const start =0
          const end = (new Date()).getTime() /1000
          const multiplier = 1
          const budget = 1_000_000_000_000_000_000
          if (!user) return null
          const responses = await Promise.all(
            tokens.map((token) =>
              fetch(
                `https://indexer.mgvinfra.com/incentives/fees/${defaultChain.id}/${token.address}?start=${start}&end=${end}&multiplier=${multiplier}&budget=${budget}`,
              ),
            ),
          )
  
          if (responses?.some((fees) => !fees.ok)) {
            throw new Error("Failed to fetch fees rewards")
          }
  
          const feesData = await Promise.all(
            responses.map(async (fees) =>
              feesResponseSchema.parse(await fees.json()),
            ),
          )
  
          return feesData.reduce((acc, curr) => acc + curr.rewards, 0)
        } catch (error) {
          console.error(error)
          return null
        }
      },
    })
  }