import { Token } from "@mangrovedao/mgv"
import { TooltipWithBounds } from "@visx/tooltip"
import { ScaleLinear } from "d3-scale"

import { cn } from "@/utils"
import { GeometricOffer } from "./geometric-distribution-dots"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  onHover?: (offer: GeometricOffer) => void
  onHoverOut?: () => void
  hoveredGeometricOffer: GeometricOffer
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
      left={xScaleTransformed(hoveredGeometricOffer.price.toNumber())}
      className="!bg-transparent"
    >
      <div
        className={cn("p-4 rounded-lg bg-[#0F1212] space-y-2 border", {
          "border-cherry-400": hoveredGeometricOffer.type === "ask",
          "border-green-bangladesh": hoveredGeometricOffer.type === "bid",
        })}
      >
        <div className="text-white">
          <span className="text-cloud-300">Price:</span>{" "}
          {hoveredGeometricOffer.price.toFixed(quoteToken?.displayDecimals)}{" "}
          {quoteToken?.symbol}
        </div>
        <div className="text-white">
          <span className="text-cloud-300">Volume:</span>{" "}
          {hoveredGeometricOffer.gives.toFixed(
            (hoveredGeometricOffer.type === "bid" ? quoteToken : baseToken)
              ?.displayDecimals,
          )}{" "}
          {
            (hoveredGeometricOffer.type === "bid" ? quoteToken : baseToken)
              ?.symbol
          }
        </div>
      </div>
    </TooltipWithBounds>
  )
}
