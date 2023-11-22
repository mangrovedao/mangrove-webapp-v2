/* eslint-disable @next/next/no-img-element */
import { getSvgUrl, getTokenInfos } from "@/utils/tokens"

export function TokenIcon({ symbol }: { symbol: string }) {
  const { color, name } = getTokenInfos(symbol)
  const src = getSvgUrl(symbol)
  return (
    <span className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}>
      <img src={src} alt={`${name} token icon`} />
    </span>
  )
}
