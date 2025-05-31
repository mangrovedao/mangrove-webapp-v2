import { MarketParams, Token } from "@mangrovedao/mgv"
import { Address } from "viem"
import { z } from "zod"

// Define Zod schemas that match the expected Mangrove types
export const TokenSchema = z
  .object({
    address: z.string().transform((val) => val as Address),
    symbol: z.string(),
    decimals: z.number(),
  })
  .transform(
    (token) =>
      ({
        ...token,
        displayDecimals: token.decimals === 18 ? 6 : token.decimals,
        priceDisplayDecimals: token.decimals === 18 ? 6 : token.decimals,
        mgvTestToken: false,
      }) as Token,
  )

export const MarketSchema = z
  .object({
    base: TokenSchema,
    quote: TokenSchema,
    bidsOlKeyHash: z.string(),
    asksOlKeyHash: z.string(),
    tickSpacing: z
      .number()
      .or(z.bigint())
      .transform((val) => BigInt(val)),
  })
  .transform((market) => market as MarketParams)

const OpenMarketsResponseSchema = z.object({
  tokens: z.array(TokenSchema),
  markets: z.array(MarketSchema),
})

// Helper to transform various date formats into valid Date objects
const dateTransformer = z.preprocess((arg) => {
  if (arg instanceof Date) return arg
  if (arg === null || arg === undefined) return new Date()
  return new Date(arg as any)
}, z.date())

const orderSchema = z.object({
  creationDate: dateTransformer,
  transactionHash: z.string(),
  feePaid: z.string(),
  lockedProvision: z.string(),
  side: z.string(),
  takerGot: z.string(),
  takerGave: z.string(),
  initialWants: z.string().optional(),
  initialGives: z.string().optional(),
  price: z.string(),
  isMarketOrder: z.boolean(),
  offerId: z.string(),
  sendToken: TokenSchema,
  receiveToken: TokenSchema,
  market: MarketSchema,

  // Limit only fields below
  expiryDate: dateTransformer.optional(),
  inboundRoute: z.string(),
  outboundRoute: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export function parseOrders(data: unknown[]): Order[] {
  return data
    .map((item) => {
      try {
        return orderSchema.parse(item)
      } catch (error) {
        // More detailed error logging
        if (error instanceof z.ZodError) {
          console.error(
            "Zod validation error for order:",
            item,
            error.issues.map((issue) => ({
              path: issue.path,
              code: issue.code,
              message: issue.message,
            })),
          )
        } else {
          console.error("Invalid format for offers: ", item, error)
        }
        return null
      }
    })
    .filter(Boolean) as Order[]
}
