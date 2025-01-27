import { BS } from "@mangrovedao/mgv/lib"
import { TimeInForce, type TimeToLiveUnit } from "./enums"

export type Form = {
  bs: BS
  limitPrice: string
  send: string
  receive: string
  timeInForce: TimeInForce
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  sendFrom: string
  receiveTo: string
  isWrapping: boolean
}
