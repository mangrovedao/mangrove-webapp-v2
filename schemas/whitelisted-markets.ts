import { z } from "zod"

import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { stringToJSONSchema } from "./json"

const marketsSchema = z.record(z.string(), z.array(z.array(z.string())))

export function getJsonFromMarketsConfig() {
  try {
    const marketsConfig = stringToJSONSchema.parse(env.NEXT_PUBLIC_MARKETS)
    return marketsSchema.parse(marketsConfig)
  } catch (e) {
    console.error(getErrorMessage(e))
  }
}
