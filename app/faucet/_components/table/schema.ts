import { z } from "zod"

const faucetTokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  id: z.string(),
})

export type FaucetToken = z.infer<typeof faucetTokenSchema>

export function parseFaucetTokens(data: unknown[]): FaucetToken[] {
  return data
    .map((item) => {
      try {
        return faucetTokenSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for tokens: ", item, error)
        return null
      }
    })
    .filter(Boolean) as FaucetToken[]
}
