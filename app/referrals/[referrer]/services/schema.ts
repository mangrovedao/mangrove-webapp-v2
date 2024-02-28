import { z } from "zod"

import { addressSchema, hexSchema } from "../../services/schema"

export const referSchema = z.object({
  message: z.object({
    referrer: addressSchema,
    referee: addressSchema,
  }),
  signature: hexSchema,
})

export const referredSchema = z.object({
  referrer: addressSchema,
  referee: addressSchema,
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

export const referGetResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    error: z.undefined(),
  }),
  z.object({
    success: z.literal(false),
    error: z.union([
      zodErrorTypeSchema,
      z.literal("already referred"),
      z.literal("wrong referrer"),
    ]),
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
