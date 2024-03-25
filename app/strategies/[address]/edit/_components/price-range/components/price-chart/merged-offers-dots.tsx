import type { ScaleLinear } from "d3-scale"

import { MergedOffer } from "@/app/strategies/[address]/_utils/inventory"
import { cn } from "@/utils"
import { type PriceRangeChartProps } from "./price-range-chart"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: MergedOffer) => void
  onHoverOut?: () => void
  hoveredOffer?: MergedOffer
} & Pick<PriceRangeChartProps, "mergedOffers">

export function MergedOffersDots({
  mergedOffers,
  xScale,
  height,
  paddingBottom,
  onHover,
  onHoverOut,
  hoveredOffer,
}: Props) {
  if (!mergedOffers) return null

  return mergedOffers.map((mergedOffer) => (
    <g
      className="group/circle cursor-pointer"
      onMouseOver={() => onHover?.(mergedOffer)}
      onMouseOut={onHoverOut}
      key={`${mergedOffer.offerType}-${mergedOffer.index}-${mergedOffer.offerId}`}
    >
      <circle
        cx={xScale(Number(mergedOffer.price))}
        cy={height - paddingBottom}
        r={8}
        className={cn(
          "opacity-0 transition-opacity group-hover/circle:opacity-100",
          {
            "fill-green-bangladesh": mergedOffer.offerType === "bids",
            "fill-cherry-400": mergedOffer.offerType === "asks",
            "fill-cloud-300": !mergedOffer.live,
            "opacity-100":
              hoveredOffer?.offerId === mergedOffer.offerId &&
              hoveredOffer?.offerType === mergedOffer.offerType,
          },
        )}
      />

      <circle
        cx={xScale(Number(mergedOffer.price))}
        cy={height - paddingBottom}
        r={3}
        className={cn({
          "fill-green-caribbean": mergedOffer.offerType === "bids",
          "fill-cherry-100": mergedOffer.offerType === "asks",
          "fill-cloud-00": !mergedOffer.live,
        })}
      />
    </g>
  ))
}
