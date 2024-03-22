import { z } from "zod"

const leaderboardEntrySchema = z.object({
  rank: z.number(),
  account: z.string(),
  taker_points: z.string().transform(parseFloat).transform(Math.floor),
  maker_points: z.string().transform(parseFloat).transform(Math.floor),
  referees_points: z.string().transform(parseFloat).transform(Math.floor),
  total_points: z.string().transform(parseFloat).transform(Math.floor),
  boost: z.string().transform(parseFloat),
  community_points: z.string().transform(parseFloat),
})

export const leaderboardSchema = z.object({
  leaderboard: z.array(leaderboardEntrySchema),
  last_updated_timestamp: z.number(),
  last_updated_block: z.number(),
})

export type Leaderboard = z.infer<typeof leaderboardSchema>
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>

export function parseLeaderboard(data: unknown) {
  try {
    return leaderboardSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for leaderboard: ", data, error)
    return null
  }
}
