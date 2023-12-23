import { z } from "zod"

export const dependencySchema = z.record(z.string())

export type Dependency = z.infer<typeof dependencySchema>

export function parseDependencies(data: unknown) {
  try {
    return dependencySchema.parse(data)
  } catch (error) {
    console.error("Invalid format for dependencies: ", data, error)
    return undefined
  }
}
