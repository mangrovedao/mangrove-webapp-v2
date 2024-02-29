import { Address, Hex, getAddress, isAddress, isHex } from "viem"
import { z } from "zod"

export const addressSchema = z
  .custom<Address>((v) => {
    return typeof v === "string" && isAddress(v)
  })
  .transform((v) => getAddress(v))

export const hexSchema = z.custom<Hex>((v) => isHex(v, { strict: true }))

export const startSchema = z.object({
  message: z.object({
    owner: addressSchema,
  }),
  signature: hexSchema,
})

export const zodErrorTypeSchema = z.object({
  name: z.literal("ZodError"),
  issues: z.tuple([
    z.object({
      code: z.literal("custom"),
      fatal: z.literal(true),
      path: z.tuple([z.literal("message"), z.literal("owner")]),
      message: z.literal("Invalid input"),
    }),
  ]),
})

export type ZodErrorType = z.infer<typeof zodErrorTypeSchema>

export const startedGetResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    error: z.undefined(),
  }),
  z.object({
    success: z.literal(false),
    error: z.union([zodErrorTypeSchema, z.literal("already started")]),
  }),
])

export const startPostResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    error: z.undefined(),
  }),
  z.object({
    success: z.literal(false),
    error: z.union([
      z.literal("Invalid signature"),
      z.literal("Already started"),
      zodErrorTypeSchema,
    ]),
  }),
])
