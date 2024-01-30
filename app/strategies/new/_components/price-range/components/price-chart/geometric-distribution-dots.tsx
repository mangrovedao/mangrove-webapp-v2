import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { type PriceRangeChartProps } from "./price-range-chart"

export type GeometricOffer = {
  type: string
  price: Big.Big
  index: number
  gives: Big.Big
  tick: number
}

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: GeometricOffer) => void
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

  return dots.map((geometricOffer) => (
    <g
      className="group/circle cursor-pointer"
      onMouseOver={() => onHover?.(geometricOffer)}
      onMouseOut={onHoverOut}
    >
      <circle
        key={`${geometricOffer.type}-${geometricOffer.index}`}
        cx={xScale(geometricOffer.price.toNumber())}
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
        key={`${geometricOffer.type}-${geometricOffer.index}`}
        cx={xScale(geometricOffer.price.toNumber())}
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
