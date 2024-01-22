import type { TradeAction } from "../enums"

export type Form = {
  tradeAction: TradeAction
  sendSource: string
  sendBalance: string
  sendToken: string
  buyAmount: string
  buyToken: string
  limitPrice: string
  receiveTo: string
}
