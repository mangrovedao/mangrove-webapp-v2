import { Token } from "@mangrovedao/mangrove.js"
import { TooltipWithBounds } from "@visx/tooltip"
import { ScaleLinear } from "d3-scale"

import { Title } from "@/components/typography/title"
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

export default function OfferTooltip({
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
        <div
          className={cn(
            "rounded py-0.5 pl-1 pr-2 inline-flex space-x-0.5 bg-primary-dark-green text-green-caribbean items-center",
          )}
        >
          <span className="w-1 h-1 rounded-full bg-green-caribbean mx-1"></span>
          <Title variant={"title3"} className="text-inherit capitalize">
            Live
          </Title>
        </div>
        <div className="text-white">
          <span className="text-cloud-300">Price:</span>{" "}
          {hoveredGeometricOffer.price.toFixed(quoteToken?.displayedDecimals)}{" "}
          {quoteToken?.symbol}
        </div>
        <div className="text-white">
          <span className="text-cloud-300">Volume:</span>{" "}
          {hoveredGeometricOffer.gives.toFixed(baseToken?.displayedDecimals)}{" "}
          {baseToken?.symbol}
        </div>
      </div>
    </TooltipWithBounds>
  )
}
