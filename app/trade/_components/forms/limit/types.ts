import { BS, Order } from "@mangrovedao/mgv/lib"
import { TimeInForce, type TimeToLiveUnit } from "./enums"

export type Form = {
  bs: BS
  limitPrice: string
  send: string
  receive: string
  orderType: Order
  timeInForce: TimeInForce
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  sendFrom: string
  receiveTo: string
}
