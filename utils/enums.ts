export type ValueOf<T> = T[keyof T]

export function enumKeys<O extends object, K extends keyof O = keyof O>(
  obj: O,
): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(Number(k))) as K[]
}

export function enumValues<O extends object>(obj: O): O[keyof O][] {
  let values = []
  for (const tl of enumKeys(obj)) {
    const value = obj[tl]

    if (typeof value === "number") {
      values.push(obj[tl])
    }
  }
  return values
}
