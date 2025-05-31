import { Address } from "viem"

type AddressSchema = Address

type TokenSchema = {
  address: AddressSchema
  symbol: string
  decimals: number
}

type MarketSchema = {
  base: TokenSchema
  quote: TokenSchema
  bidsOlKeyHash: string
  asksOlKeyHash: string
  tickSpacing: bigint
}

type OpenMarketSchema = {
  tokens: TokenSchema[]
  markets: MarketSchema[]
}

export type Token = TokenSchema
export type Market = MarketSchema
export type OpenMarket = OpenMarketSchema

type OrderStatusSchema = "Filled" | "Partial"
type OrderTypeSchema = "Market" | "GTC" | "PO" | "IOC" | "FOK" | "GTCE"

type OrderSchema = {
  type: OrderTypeSchema
  received: number
  sent: number
  status: OrderStatusSchema
  offerId: string | null
  lockedProvision: string
  transactionHash: string
  fee: number
  block: number
  timestamp: number
  receiveToken: AddressSchema
  sendToken: AddressSchema
  tickSpacing: bigint
  totalWants?: number // For limit orders
  totalGives?: number // For limit orders
}

export type Order = OrderSchema
