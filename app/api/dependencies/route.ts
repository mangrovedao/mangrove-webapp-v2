/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from "fs"
import yaml from "js-yaml"
import path from "path"

export function GET() {
  const lockFilePath = path.join(process.cwd(), "pnpm-lock.yaml")
  const lockFile = yaml.load(fs.readFileSync(lockFilePath, "utf8"))

  // @ts-ignore
  const filteredLockFile = Object.keys(lockFile.packages || {}).filter((key) =>
    key.startsWith("/@mangrovedao/"),
  )

  const dependencies = filteredLockFile.reduce((acc, dep) => {
    const [, name, version] = dep.split("@")
    const cleanVersion = version?.match(/[0-9.]+(-[0-9]+)?/)?.[0] // Extract only the version number

    // @ts-ignore
    acc[`@${name}`] = cleanVersion
    return acc
  }, {})

  return Response.json(dependencies)
}
