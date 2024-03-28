import { z } from "zod"

const balanceSchema = z.object({
  address: z.string(),
})
export type Balance = z.infer<typeof balanceSchema>
