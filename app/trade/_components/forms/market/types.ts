import type { TradeAction } from "../enums"

export type Form = {
  tradeAction: TradeAction
  send: string
  receive: string
  slippage: number
  estimatedFee?: string
}
