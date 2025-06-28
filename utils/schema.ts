import { z } from "zod/v4"

export const AddressSchema = z.templateLiteral(["0x", z.string().length(40)])
export const TransactionHashSchema = z.templateLiteral([
  "0x",
  z.string().length(64),
])
export const LimitOrderType = z.enum(["GTC", "IOC", "PO", "FOK"])
export const MarketOrderType = z.enum(["Market"])
export const OrderType = z.union([LimitOrderType, MarketOrderType])
