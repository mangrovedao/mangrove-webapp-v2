import { Address } from "viem"

export interface OdosQuoteParams {
  chainId?: number
  inputTokens: {
    tokenAddress: Address
    amount: string
  }[]
  outputTokens: {
    tokenAddress: Address
    proportion: number
  }[]
  userAddr?: Address
  slippageLimitPercent: number
}

export interface OdosAssembledTransaction {
  gas: number
  gasPrice: number
  value: string
  to: string
  from: string
  data: string
  nonce: number
  chainId: number
}
