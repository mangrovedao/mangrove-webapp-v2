import { Token } from "@mangrovedao/mangrove.js"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
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

export type AssetWithInfos = {
  token: Token | undefined
  receiveTo: SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined
  amount: string
  limitPrice: string
}
