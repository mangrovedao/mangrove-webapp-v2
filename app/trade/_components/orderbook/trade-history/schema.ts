import { z } from "zod"

const tradeHistorySchema = z.object({
  creationDate: z.date(),
  transactionHash: z.string(),
  isBid: z.boolean(),
  takerGot: z.string(),
  takerGave: z.string(),
  penalty: z.string(),
  feePaid: z.string(),
  initialWants: z.string(),
  initialGives: z.string(),
  price: z.string(),
  status: z.string(),
  isMarketOrder: z.boolean(),
})

export type TradeHistory = z.infer<typeof tradeHistorySchema>

const noZeroTakerAndMakerFilter = (trade: TradeHistory) => Number(trade.takerGot) !== 0 && Number(trade.takerGave) !== 0

export function parseTradeHistory(data: unknown[]): TradeHistory[] {
  return (data
    .map((item) => {
      try {
        return tradeHistorySchema.parse(item)
      } catch (error) {
        console.error("Invalid format for trade history: ", item, error)
        return null
      }
    })
    .filter(Boolean) as TradeHistory[])
    .filter(noZeroTakerAndMakerFilter)
}
