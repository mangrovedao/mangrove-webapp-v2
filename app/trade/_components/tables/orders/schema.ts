import { z } from "zod"

const orderSchema = z.object({
  creationDate: z.date(),
  latestUpdateDate: z.date(),
  expiryDate: z.date().optional(),
  transactionHash: z.string(),
  isBid: z.boolean(),
  takerGot: z.string(),
  takerGave: z.string(),
  penalty: z.string(),
  feePaid: z.string(),
  initialWants: z.string(),
  initialGives: z.string(),
  price: z.string(),
  offerId: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export function parseOrders(data: unknown[]): Order[] {
  return data
    .map((item) => {
      try {
        return orderSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for offers: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Order[]
}

const amplifiedOrderSchema = z.object({
  id: z.string(),
  creationDate: z.string(),
  owner: z
    .object({
      address: z.string(),
    })
    .transform((data) => data.address),
  offers: z.array(
    z.object({
      id: z.string(),
      inboundRoute: z.string(),
      outboundRoute: z.string(),
      latestTransactionHash: z.string(),
      creationDate: z.date(),
      latestUpdateDate: z.date(),
      offerId: z.string(),
      gives: z.string(),
      gasprice: z.string(),
      gasreq: z.string(),
      gasBase: z.string(),
      prevGives: z.nullable(z.unknown()),
      prevTick: z.nullable(z.unknown()),
      tick: z.string(),
      isOpen: z.boolean(),
      totalGot: z.string(),
      totalGave: z.string(),
      isFailed: z.boolean(),
      isFilled: z.boolean(),
      isRetracted: z.boolean(),
      failedReason: z.nullable(z.unknown()),
      posthookFailReason: z.nullable(z.unknown()),
      deprovisioned: z.boolean(),
      market: z.object({
        id: z.string(),
        inbound_tkn: z.string(),
        outbound_tkn: z.string(),
        tickSpacing: z.string(),
      }),
      maker: z.object({
        id: z.string(),
        address: z.string(),
      }),
      owner: z.nullable(z.unknown()),
      isMarketFound: z.boolean(),
      price: z.string(),
    }),
  ),
})

export type AmplifiedOrder = z.infer<typeof amplifiedOrderSchema>

export function parseAmplifiedOrders(data: unknown[]): AmplifiedOrder[] {
  return data
    .map((item) => {
      try {
        return amplifiedOrderSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for offers: ", item, error)
        return null
      }
    })
    .filter(Boolean) as AmplifiedOrder[]
}
