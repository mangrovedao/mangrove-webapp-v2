import { z } from "zod"

export const pointsSchema = z.object({
  last_updated_block: z.number(),
  rank: z.number(),
  account: z.string(),
  taker_points: z.string(),
  maker_points: z.string(),
  referees_points: z.string(),
  total_points: z.string(),
  last_updated_timestamp: z.number(),
})

export type Points = z.infer<typeof pointsSchema>

export function parsePoints(data: unknown) {
  try {
    return pointsSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for points: ", data, error)
    return null
  }
}
