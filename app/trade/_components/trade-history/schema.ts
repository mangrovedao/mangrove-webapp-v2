import { z } from "zod"

// Original schema for historical reasons
const tradeHistorySchema = z.object({
  type: z.string(),
  price: z.number(),
  baseAmount: z.number(),
  quoteAmount: z.number(),
  timestamp: z.number(),
  fee: z.number(),
  transactionHash: z.string(),
  block: z.number(),
})

export type TradeHistory = z.infer<typeof tradeHistorySchema>

// Function to parse trade history from the API
export function parseTradeHistory(data: any): TradeHistory[] {
  // Assuming data structure has a 'trades' array
  if (!data || !Array.isArray(data.trades)) {
    return []
  }

  return data.trades.map((trade: any) => {
    try {
      // Convert Unix timestamp to Date
      const creationDate = new Date(trade.timestamp * 1000)

      // Map API trade structure to TradeHistory
      return {
        creationDate,
        type: trade.type,
        price: trade.price,
        baseAmount: trade.baseAmount,
        quoteAmount: trade.quoteAmount,
        timestamp: trade.timestamp,
        fee: trade.fee,
        transactionHash: trade.transactionHash,
      }
    } catch (error) {
      console.error("Error parsing trade:", error, trade)
      return undefined
    }
  })
}
