/* eslint-disable @next/next/no-img-element */
import { API_IMAGE_URL } from "@/hooks/use-odos"
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
  const srcFallback = API_IMAGE_URL(symbol);
  return (
    <span
      className={cn("w-6 max-h-6 rounded-full", className)}
      style={{ backgroundColor: color }}
    >
      <img
        src={srcFallback}
        alt={`${name} token icon`}
        className={imgClasses}
        onError={(e) => {
          e.currentTarget.src = src
        }}
      />
    </span>
  )
}
