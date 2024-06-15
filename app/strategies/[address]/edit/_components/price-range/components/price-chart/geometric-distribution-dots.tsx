import { OfferParsed } from "@mangrovedao/mgv"
import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { type PriceRangeChartProps } from "./price-range-chart"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: OfferParsed) => void
  onHoverOut?: () => void
} & Pick<PriceRangeChartProps, "geometricKandelDistribution">

export function GeometricKandelDistributionDots({
  geometricKandelDistribution,
  xScale,
  height,
  paddingBottom,
  onHover,
  onHoverOut,
}: Props) {
  if (!geometricKandelDistribution) return null
  const dots = [
    ...geometricKandelDistribution?.bids.map((bid) => ({
      ...bid,
      type: "bid",
    })),
    ...geometricKandelDistribution?.asks.map((ask) => ({
      ...ask,
      type: "ask",
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
            "fill-green-bangladesh": geometricOffer.type === "bid",
            "fill-cherry-400": geometricOffer.type === "ask",
          },
        )}
      />

      <circle
        cx={xScale(geometricOffer.price)}
        cy={height - paddingBottom}
        r={3}
        className={cn({
          "fill-green-caribbean": geometricOffer.type === "bid",
          "fill-cherry-100": geometricOffer.type === "ask",
        })}
      />
    </g>
  ))
}
