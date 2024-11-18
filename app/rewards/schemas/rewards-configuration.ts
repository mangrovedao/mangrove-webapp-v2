import { z } from "zod"

export const rewardsSchema = z.object({
  chainId: z.number(),
  epoch: z.number(),
  user: z.string(),
  takerReward: z.union([z.string(), z.number()]),
  makerReward: z.number(),
  kandelRewards: z.number(),
  claimableRewards: z.number(),
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
