import { z } from "zod"

export const volumeSchema = z
  .string()
  .transform(parseFloat)
  .transform(Math.floor)

export type Volume = z.infer<typeof volumeSchema>

export function parseVolume(data: unknown) {
  try {
    return volumeSchema.parse(data)
  } catch (error) {
    console.error("Invalid format for volume: ", data, error)
    return null
  }
}