import { TimeInForce } from "../../forms/amplified/enums"
import { TimeToLiveUnit } from "../../forms/limit/enums"
import { DefaultLogics } from "../../forms/types"

export type Form = {
  limitPrice: string
  send: string
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  isBid: boolean
}

type Asset = {
  limitPrice: string
  receiveAmount: string
}

export enum AmplifiedOrderStatus {
  "Open",
  "Closed",
}

export type AmplifiedForm = {
  send: string
  sendFrom: DefaultLogics
  assets: Asset[]
  timeInForce: TimeInForce
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  status: AmplifiedOrderStatus
}
