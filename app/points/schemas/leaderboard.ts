import { z } from "zod"

const leaderboardEntrySchema = z.object({
  rank: z.number(),
  account: z.string(),
  taker_points: z.string(),
  maker_points: z.string(),
  referees_points: z.string(),
  total_points: z.string(),
})

export const leaderboardSchema = z.object({
  leaderboard: z.array(leaderboardEntrySchema),
  last_updated_timestamp: z.number(),
  last_updated_block: z.number(),
})

export type Leaderboard = z.infer<typeof leaderboardSchema>

export function parseLeaderboard(data: unknown) {
  try {
    return leaderboardSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for leaderboard: ", data, error)
    return null
  }
}
