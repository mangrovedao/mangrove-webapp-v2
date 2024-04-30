import { z } from "zod"

const epochEntrySchema = z.object({
  account: z.string(),
  taker: z.number(),
  maker: z.number(),
  boost: z.number(),
  ref: z.number(),
  community: z.number().default(0),
  total: z.number(),
  rank: z.number(),
  share: z.number(),
})

const epochLeaderboardSchema = z.array(epochEntrySchema)

export type LeaderboardEpochEntry = z.infer<typeof epochEntrySchema>

export function parseEpochLeaderboard(data: unknown) {
  try {
    return epochLeaderboardSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for epoch leaderboard: ", data, error)
    return null
  }
}
