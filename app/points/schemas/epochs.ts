import { z } from "zod"

export const epochsEntry = z.object({
  blocks: z.object({ start: z.number(), end: z.number().nullable() }),
  finished: z.boolean(),
  name: z.string(),
  real: z.object({ start: z.string(), end: z.string() }),
})

const epochsSchema = z.array(epochsEntry)

export function parseEpochs(data: unknown) {
  try {
    return epochsSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for epochs: ", data, error)
    return null
  }
}
