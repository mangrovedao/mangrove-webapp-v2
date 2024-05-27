import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { z } from "zod"
import { stringToJSONSchema } from "./json"

export const schema = z.object({
  strategy: z.object({
    create: z.object({ enabled: z.boolean(), message: z.string() }),
  }),
})

type FeatureFlagConfig = z.infer<typeof schema>

export function getFeatureFlagConfig(): FeatureFlagConfig | undefined {
  try {
    const config = stringToJSONSchema.parse(env.NEXT_PUBLIC_FEATURE_FLAG)
    return schema.parse(config)
  } catch (e) {
    console.error(getErrorMessage(e))
  }
}
