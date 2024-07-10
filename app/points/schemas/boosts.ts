import { z } from "zod"

export const boostsSchema = z.array(
  z.object({
    account: z.string(),
    type: z.string(),
    boost: z.string().transform(parseFloat),
    volume: z.string().transform(parseFloat).transform(Math.floor),
  }),
)

export type Boosts = z.infer<typeof boostsSchema>

export function parseBoosts(data: unknown) {
  try {
    return boostsSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for boosts: ", data, error)
    return null
  }
}
