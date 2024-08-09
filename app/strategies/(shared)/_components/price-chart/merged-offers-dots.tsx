import { OfferParsed } from "@mangrovedao/mgv"
import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { BA } from "@mangrovedao/mgv/lib"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: OfferParsed) => void
  onHoverOut?: () => void
  hoveredOffer?: OfferParsed
  distribution?: OfferParsed[]
}

export function MergedOffersDots({
  distribution,
  xScale,
  height,
  paddingBottom,
  onHover,
  onHoverOut,
  hoveredOffer,
}: Props) {
  if (!distribution) return null

  return distribution.map((mergedOffer) => (
    <g
      className="group/circle cursor-pointer"
      onMouseOver={() => onHover?.(mergedOffer)}
      onMouseOut={onHoverOut}
      key={`${mergedOffer.ba}-${mergedOffer.index}-${mergedOffer.id}`}
    >
      <circle
        cx={xScale(Number(mergedOffer.price))}
        cy={height - paddingBottom}
        r={8}
        className={cn(
          "opacity-0 transition-opacity group-hover/circle:opacity-100",
          {
            "fill-green-bangladesh": mergedOffer.ba === BA.bids,
            "fill-cherry-400": mergedOffer.ba === BA.asks,
            "fill-cloud-300": !(mergedOffer.gives > 0),
            "opacity-100":
              hoveredOffer?.id === mergedOffer.id &&
              hoveredOffer?.ba === mergedOffer.ba,
          },
        )}
      />

      <circle
        cx={xScale(Number(mergedOffer.price))}
        cy={height - paddingBottom}
        r={3}
        className={cn({
          "fill-green-caribbean": mergedOffer.ba === BA.bids,
          "fill-cherry-100": mergedOffer.ba === BA.asks,
          "fill-cloud-00": !(mergedOffer.gives > 0),
        })}
      />
    </g>
  ))
}
