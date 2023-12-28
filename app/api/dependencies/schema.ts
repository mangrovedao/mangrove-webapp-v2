import { z } from "zod"

const dependencySchema = z.record(z.string())

export function parseDependencies(data: unknown) {
  try {
    return dependencySchema.parse(data)
  } catch (error) {
    console.error("Invalid format for dependencies: ", data, error)
    return undefined
  }
}
