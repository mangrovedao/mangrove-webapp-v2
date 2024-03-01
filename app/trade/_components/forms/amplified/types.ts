import { TimeInForce, TimeToLiveUnit } from "./enums"

export type Asset = {
  amount: string
  token: string
  limitPrice: string
  receiveTo: string
}

export type Form = {
  sendSource: string
  sendAmount: string
  sendToken: string
  assets: Asset[]
  timeInForce: TimeInForce
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit
}
