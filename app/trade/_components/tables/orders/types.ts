import { TimeToLiveUnit } from "../../forms/limit/enums"

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
  assets: Asset[]
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
  status: AmplifiedOrderStatus
}
