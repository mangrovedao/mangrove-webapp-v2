import { z } from "zod"

const leaderboardSchema = z.object({
  weightFromBlock: z.number(),
  account: z.string(),
  taker_points: z.string(),
  maker_points: z.string(),
  total_points: z.string(),
})

export type Leaderboard = z.infer<typeof leaderboardSchema>

export function parseLeaderboard(data: unknown[]): Leaderboard[] {
  return data
    .map((item) => {
      try {
        return leaderboardSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for leaderboard: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Leaderboard[]
}
