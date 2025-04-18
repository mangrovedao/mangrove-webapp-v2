/* eslint-disable @next/next/no-img-element */
import { cn } from "@/utils"
import { getSvgUrl, getTokenInfos } from "@/utils/tokens"

export function TokenIcon({
  symbol,
  className,
  imgClasses,
}: {
  symbol?: string
  className?: string
  imgClasses?: string
}) {
  if (!symbol) return null

  const { color, name } = getTokenInfos(symbol)
  const src = getSvgUrl(symbol)
  return (
    <span
      className={cn("rounded-full", { className, imgClasses })}
      style={{ backgroundColor: color }}
    >
      <img src={src} alt={`${name} token icon`} className={imgClasses} />
    </span>
  )
}
