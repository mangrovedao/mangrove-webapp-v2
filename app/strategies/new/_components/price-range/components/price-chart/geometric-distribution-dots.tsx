import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { type PriceRangeChartProps } from "./price-range-chart"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
} & Pick<PriceRangeChartProps, "geometricKandelDistribution">

export function GeometricKandelDistributionDots({
  geometricKandelDistribution,
  xScale,
  height,
  paddingBottom,
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
  ))
}
