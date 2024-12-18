/* eslint-disable @next/next/no-img-element */
import { ODOS_API_IMAGE_URL } from "@/hooks/use-odos"
import { cn } from "@/utils"
import { getSvgUrl, getTokenInfos } from "@/utils/tokens"

export function TokenIcon({
  symbol,
  className,
  imgClasses,
  customSrc,
  useFallback
}: {
  symbol?: string
  className?: string
  imgClasses?: string
  customSrc?: string
  useFallback?: boolean
}) {
  if (!symbol) return null

  const { color, name } = getTokenInfos(symbol)
  const src = getSvgUrl(symbol)

  return (
    <span
      className={cn("w-6 max-h-6 rounded-full", className)}
      style={{ backgroundColor: color }}
    >
      <img
        src={customSrc || src}
        alt={`${name} token icon`}
        className={imgClasses}
        onError={(e) => {
          if (useFallback) {
            e.currentTarget.src = src
          }
        }}
      />
    </span>
  )
}
