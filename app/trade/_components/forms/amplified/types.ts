import { Logic, Token } from "@mangrovedao/mgv"
import { TimeInForce, TimeToLiveUnit } from "./enums"

export type Asset = {
  amount: string
  token: string
  limitPrice: string
  receiveTo: string
}

export type AssetWithInfos = {
  token: Token | undefined
  receiveTo: Logic
  amount: string
  limitPrice: string
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
