import { DistributionOffer, Token } from "@mangrovedao/mgv"
import { TooltipWithBounds } from "@visx/tooltip"
import { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { BA } from "@mangrovedao/mgv/lib"

export type TypedDistrubutionOffer = DistributionOffer & { type: BA }

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: DistributionOffer) => void
  onHoverOut?: () => void
  hoveredGeometricOffer: TypedDistrubutionOffer
  baseToken: Token
  quoteToken: Token
}

export function GeometricOfferTooltip({
  height,
  paddingBottom,
  xScale: xScaleTransformed,
  hoveredGeometricOffer,
  baseToken,
  quoteToken,
}: Props) {
  return (
    <TooltipWithBounds
      top={height - paddingBottom}
      left={xScaleTransformed(hoveredGeometricOffer.price)}
      className="!bg-transparent"
    >
      <div
        className={cn("p-4 rounded-lg bg-[#0F1212] space-y-2 border", {
          "border-cherry-400": hoveredGeometricOffer.type === BA.asks,
          "border-green-bangladesh": hoveredGeometricOffer.type === BA.bids,
        })}
      >
        <div className="text-white">
          <span className="text-cloud-300">Price:</span>{" "}
          {hoveredGeometricOffer.price.toFixed(quoteToken?.displayDecimals)}{" "}
          {quoteToken?.symbol}
        </div>
        <div className="text-white">
          <span className="text-cloud-300">Volume:</span>{" "}
          {Number(hoveredGeometricOffer.gives).toFixed(
            (hoveredGeometricOffer.type === BA.bids ? quoteToken : baseToken)
              ?.displayDecimals,
          )}{" "}
          {
            (hoveredGeometricOffer.type === BA.bids ? quoteToken : baseToken)
              ?.symbol
          }
        </div>
      </div>
    </TooltipWithBounds>
  )
}
