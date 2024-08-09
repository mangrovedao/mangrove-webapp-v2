import { TimeToLiveUnit } from "../../forms/limit/enums"

export type Form = {
  limitPrice: string
  send: string
  receive: string
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  isBid: boolean
}
