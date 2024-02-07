import type { TradeAction } from "../enums"

type Asset = {
  amount: string
  token: string
  limitPrice: string
  receiveTo: string
}

export type Form = {
  tradeAction: TradeAction
  sendSource: string
  sendAmount: string
  sendToken: string
  firstAsset: Asset
  secondAsset: Asset
}
