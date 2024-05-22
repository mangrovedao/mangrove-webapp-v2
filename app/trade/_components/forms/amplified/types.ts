import { Token } from "@mangrovedao/mgv"

import { DefaultTradeLogics } from "../types"
import { TimeInForce, TimeToLiveUnit } from "./enums"

export type Asset = {
  amount: string
  token: string
  limitPrice: string
  receiveTo: string
}

export type AssetWithInfos = {
  token: Token | undefined
  receiveTo: DefaultTradeLogics
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
