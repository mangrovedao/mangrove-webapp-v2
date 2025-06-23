import { z } from "zod"

export const rewardsSchema = z.object({
  chainId: z.number(),
  epoch: z.number(),
  user: z.string(),
  takerReward: z.number().or(z.string()),
  makerReward: z.number().or(z.string()),
  claimableRewards: z.number().or(z.string()),
  vaultRewards: z.number().or(z.string()),
})

export const userIncentiveResponseSchema = z.object({
  vault: z.string(),
  rewards: z.number(),
  currentRewardsPerSecond: z.number(),
  timestamp: z.number(),
})

export const vaultIncentivesSchema = z.object({
  leaderboard: z.array(
    z.object({
      position: z.number(),
      user: z.string(),
      vault: z.string(),
      rewards: z.number(),
      currentRewardsPerSecond: z.number(),
    }),
  ),
  nPages: z.number(),
  nElements: z.number(),
  isOver: z.boolean(),
  timestamp: z.number(),
})

export const configurationSchema = z.object({
  precision: z.object({
    points: z.string(),
    reward: z.string(),
    spread: z.string(),
    emaComputations: z.string(),
  }),
  chains: z.record(
    z.object({
      parameters: z.object({
        lambdaMaker: z.object({
          initialValue: z.string(),
        }),
        lambdaKandel: z.object({
          initialValue: z.string(),
        }),
        rhoTaker: z.object({
          initialValue: z.string(),
        }),
        rhoMaker: z.object({
          initialValue: z.string(),
        }),
      }),
      tokens: z.record(
        z.object({
          cTaker: z.object({
            initialValue: z.string(),
          }),
          cMaker: z.object({
            initialValue: z.string(),
          }),
        }),
      ),
      offerLists: z.object({
        fallback: z.object({
          minimumSpread: z.string(),
          maximumSpread: z.string(),
        }),
      }),
      rewardsLimit: z.record(
        z.object({
          startTimestamp: z.string(),
          budget: z.string(),
        }),
      ),
    }),
  ),
})
