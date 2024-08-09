import { Distribution, DistributionOffer } from "@mangrovedao/mgv"
import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { BA } from "@mangrovedao/mgv/lib"

export type TypedDistrubutionOffer = DistributionOffer & { type: BA }

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: TypedDistrubutionOffer) => void
  onHoverOut?: () => void
} & { distribution?: Distribution }

export function GeometricKandelDistributionDots({
  distribution,
  xScale,
  height,
  paddingBottom,
  onHover,
  onHoverOut,
}: Props) {
  if (!distribution) return null

  const dots = [
    ...distribution?.bids.map((bid) => ({
      ...bid,
      type: BA.bids,
    })),
    ...distribution?.asks.map((ask) => ({
      ...ask,
      type: BA.asks,
    })),
  ]
  const filteredDots = dots.filter((dot) => dot.gives > 0)

  return filteredDots.map((geometricOffer) => (
    <g
      className="group/circle cursor-pointer"
      onMouseOver={() => onHover?.(geometricOffer)}
      onMouseOut={onHoverOut}
      key={`${geometricOffer.type}-${geometricOffer.index}`}
    >
      <circle
        cx={xScale(geometricOffer.price)}
        cy={height - paddingBottom}
        r={8}
        className={cn(
          "opacity-0 transition-opacity group-hover/circle:opacity-100",
          {
            "fill-green-bangladesh": geometricOffer.type === BA.bids,
            "fill-cherry-400": geometricOffer.type === BA.asks,
          },
        )}
      />

      <circle
        cx={xScale(geometricOffer.price)}
        cy={height - paddingBottom}
        r={3}
        className={cn({
          "fill-green-caribbean": geometricOffer.type === BA.bids,
          "fill-cherry-100": geometricOffer.type === BA.asks,
        })}
      />
    </g>
  ))
}
