import type { TradeAction } from "../enums"
import { type TimeInForce, type TimeToLiveUnit } from "./enums"

export type TimeInForceValue = `${TimeInForce}`
export type TimeToLiveUnitValue = `${TimeToLiveUnit}`

export type Form = {
  tradeAction: TradeAction
  send: string
  receive: string
}
