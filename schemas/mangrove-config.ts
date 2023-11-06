import { z } from "zod"

import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { stringToJSONSchema } from "./json"

const tokenSchema = z.object({
  decimals: z.number(),
  cashness: z.number(),
  displayedAsPriceDecimals: z.number(),
  displayedDecimals: z.number(),
})

const mangroveConfigSchema = z.object({
  tokens: z.record(z.string(), tokenSchema),
})

function getMangroveConfigFromEnvVariable() {
  try {
    const mangroveConfig = stringToJSONSchema.parse(
      env.NEXT_PUBLIC_MANGROVE_CONFIG,
    )
    return mangroveConfigSchema.parse(mangroveConfig)
  } catch (e) {
    console.error(getErrorMessage(e))
    return {}
  }
}

export const mangroveConfig = getMangroveConfigFromEnvVariable()
