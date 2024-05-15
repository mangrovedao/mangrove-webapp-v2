import { BS, Order } from "@mangrovedao/mgv/lib"
import { type TimeToLiveUnit } from "./enums"

export type Form = {
  bs: BS
  limitPrice: string
  send: string
  receive: string
  orderType: Order
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  sendFrom: string
  receiveTo: string
}
