import { z } from "zod"

const leaderboardEntrySchema = z.object({
  rank: z.number(),
  account: z.string(),
  taker: z.number(),
  maker: z.number(),
  ref: z.number(),
  total: z.number().nullable(),
  share: z.number().nullable(),
})

const epochLeaderboardSchema = z.array(leaderboardEntrySchema)
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>

export function parseLeaderboard(data: unknown) {
  try {
    return epochLeaderboardSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for total leaderboard: ", data, error)
    return null
  }
}
