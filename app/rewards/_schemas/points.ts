import { z } from "zod"

export const rewardsSchema = z.object({
  last_updated_block: z.number(),
  rank: z.number(),
  account: z.string(),
  taker_points: z.string().transform(parseFloat).transform(Math.floor),
  maker_points: z.string().transform(parseFloat).transform(Math.floor),
  referees_points: z.string().transform(parseFloat).transform(Math.floor),
  total_points: z.string().transform(parseFloat).transform(Math.floor),
  last_updated_timestamp: z.number(),
  boost: z.string().transform(parseFloat),
  community_points: z.string().transform(parseFloat),
})

export type Points = z.infer<typeof rewardsSchema>

export function parsePoints(data: unknown) {
  try {
    return rewardsSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for points: ", data, error)
    return null
  }
}
