type Asset = {
  amount: string
  token: string
  limitPrice: string
  receiveTo: string
}

export type Form = {
  sendSource: string
  sendAmount: string
  sendToken: string
  firstAsset: Asset
  secondAsset: Asset
}
