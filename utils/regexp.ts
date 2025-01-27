export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}

export function getExactWeiAmount(value: string, decimals?: number): string {
  return (
    value.match(new RegExp(`^-?\\d+(?:\\.\\d{0,${decimals || 8}})?`))?.[0] ||
    "0"
  )
}
