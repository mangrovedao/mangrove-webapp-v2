import { z } from "zod"

const BoostType = z.enum(["NFT", "Volume"])

export const boostsSchema = z.array(
  z.object({
    account: z.string(),
    type: BoostType,
    boost: z.string().transform(parseFloat).transform(Math.floor),
    volume: z.string().transform(parseFloat).transform(Math.floor),
  }),
)

export type Boosts = z.infer<typeof boostsSchema>
export type BoostType = z.infer<typeof BoostType>

export function parseBoosts(data: unknown) {
  try {
    return boostsSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for boosts: ", data, error)
    return null
  }
}
