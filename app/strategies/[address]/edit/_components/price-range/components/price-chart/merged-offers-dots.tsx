import type { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { OfferParsed } from "@mangrovedao/mgv"
import { BA } from "@mangrovedao/mgv/lib"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: OfferParsed) => void
  onHoverOut?: () => void
  hoveredOffer?: OfferParsed
} & { distribution: OfferParsed[] }

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

  return distribution.map((offer) => (
    <g
      className="group/circle cursor-pointer"
      onMouseOver={() => onHover?.(offer)}
      onMouseOut={onHoverOut}
      key={`${offer.ba}-${offer.index}-${offer.id}`}
    >
      <circle
        cx={xScale(Number(offer.price))}
        cy={height - paddingBottom}
        r={8}
        className={cn(
          "opacity-0 transition-opacity group-hover/circle:opacity-100",
          {
            "fill-green-bangladesh": offer.ba === BA.bids,
            "fill-cherry-400": offer.ba === BA.asks,
            "fill-cloud-300": !(offer.gives > 0),
            "opacity-100":
              hoveredOffer?.id === offer.id && hoveredOffer?.ba === offer.ba,
          },
        )}
      />

      <circle
        cx={xScale(Number(offer.price))}
        cy={height - paddingBottom}
        r={3}
        className={cn({
          "fill-green-caribbean": offer.ba === BA.bids,
          "fill-cherry-100": offer.ba === BA.asks,
          "fill-cloud-00": !(offer.gives > 0),
        })}
      />
    </g>
  ))
}
