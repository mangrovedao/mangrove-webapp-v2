import { useAccount } from "wagmi"
import { feesResponseSchema, incentiveResponseSchema } from "../schemas/rewards-configuration"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { useTokens } from "@/hooks/use-addresses"
import { baseEURC } from "@mangrovedao/mgv/addresses/tokens/base"
import { Token } from "@mangrovedao/mgv"
import { base } from "viem/chains"
import { blastBLAST } from "@mangrovedao/mgv/addresses/tokens/blast"
import { arbitrum } from "viem/chains"
import { blastUSDe } from "@mangrovedao/mgv/addresses/tokens/blast"
import { blast } from "viem/chains"
import { arbitrumweETH, arbitrumUSDT, arbitrumUSDC, arbitrumWETH, blastWETH, baseWETH, baseUSDC, baseCBETH, baseWSTETH, blastMetaStreetWETHPUNKS40, blastUSDB, blastMetaStreetWETHPUNKS20, baseCBBTC } from "@mangrovedao/mgv/_types/addresses"
import { arbitrumWBTC } from "@mangrovedao/mgv/addresses"

const budget =600_000
export const rewardsProgramPerToken = (chainId: number, token: Token) => {
const rewardsPerToken = {
  [blast.id]: {
    [blastWETH.address]: 0,
    [blastUSDB.address]: 0,
    [blastUSDe.address]: 0,
    [blastBLAST.address]: 0,
    [blastMetaStreetWETHPUNKS20.address]: 0,
    [blastMetaStreetWETHPUNKS40.address]: 0,
  },
  [arbitrum.id]: {
    [arbitrumWETH.address]: 0,
    [arbitrumWBTC.address]: 0,
    [arbitrumUSDC.address]: 0,
    [arbitrumUSDT.address]: 0,
    [arbitrumweETH.address]: 0,
  },
  [base.id]: {
    [baseUSDC.address]: 27,
    [baseEURC.address]: 27,
    [baseWETH.address]: 43_200,
    [baseCBETH.address]: 43_200,
    [baseWSTETH.address]: 43_200,
    [baseCBBTC.address]: 2_160_000 ,
  }
}
  return rewardsPerToken[chainId][token.address]
}
export const useFeesRewards = () => {
    const { address: user } = useAccount()
    const { defaultChain } = useDefaultChain()
    const tokens = useTokens() 
    return useQuery({
      queryKey: ["fees-rewards", defaultChain.id, user],
      queryFn: async () => {
        try {
          const rewardsPerToken =tokens.reduce((acc, token) => {
            acc[token.address] = rewardsProgramPerToken(defaultChain.id, token)
            return acc
          }, {} as Record<string, number>)
          const start =0
          const end = (new Date()).getTime() /1000
          const multiplier = 1
          if (!user) return null
          const responses = await Promise.all(
            tokens.map((token) =>
              fetch(
                `https://indexer.mgvinfra.com/incentives/fees/${defaultChain.id}/${token.address}?start=${start}&end=${end}&multiplier=${rewardsPerToken[token.address]}&budget=${budget}`,
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
          const leaderByUser: Record<string, number> = {}
          feesData.forEach((fees) => {
            fees.leaderboard.forEach((leader) => {
              if(leaderByUser[leader.user]){
                leaderByUser[leader.user]! += leader.rewards
              }else{
                leaderByUser[leader.user] = leader.rewards
              }
            })
          })
          return Object.entries(leaderByUser).map(([user, rewards]) => ({
            user,
            rewards: Number(rewards),
          })).sort((a, b) => b.rewards - a.rewards)
        } catch (error) {
          console.error(error)
          return null
        }
      },
    })
  }