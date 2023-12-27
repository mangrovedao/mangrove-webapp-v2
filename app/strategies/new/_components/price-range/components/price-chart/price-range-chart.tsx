"use client"
import {
  type GeometricKandelDistribution,
  type Market,
} from "@mangrovedao/mangrove.js"
import { AxisLeft, AxisTop } from "@visx/axis"
import { curveStep } from "@visx/curve"
import { localPoint } from "@visx/event"
import { scaleLinear } from "@visx/scale"
import { AreaClosed } from "@visx/shape"
import { Zoom } from "@visx/zoom"
import { type ProvidedZoom } from "@visx/zoom/lib/types"
import Big from "big.js"
import { Minus, Plus } from "lucide-react"
import React from "react"
import useResizeObserver from "use-resize-observer"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useKeyPress } from "@/hooks/use-key-press"
import { cn } from "@/utils"
import { BackgroundRectangles } from "./background-rectangles"
import CustomBrush from "./custom-brush"
import { GeometricKandelDistributionDots } from "./geometric-distribution-dots"
import { RangeTooltips } from "./range-tooltips"

const paddingRight = 54
const paddingBottom = 44
const maxToTheTopRatio = 0.8

const initialTransform = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
}

export type PriceRangeChartProps = {
  baseToken?: string
  quoteToken?: string
  initialMidPrice?: number
  bids?: Market.Offer[]
  asks?: Market.Offer[]
  onPriceRangeChange?: (priceRange: number[]) => void
  priceRange?: [number, number]
  viewOnly?: boolean
  isLoading?: boolean
  geometricKandelDistribution?: ReturnType<
    typeof GeometricKandelDistribution.prototype.getOffersWithPrices
  >
}

export function PriceRangeChart({
  bids = [],
  asks = [],
  initialMidPrice,
  onPriceRangeChange,
  priceRange,
  viewOnly = false,
  isLoading = false,
  geometricKandelDistribution,
}: PriceRangeChartProps) {
  const { ref, width = 0, height = 0 } = useResizeObserver()
  const offers = [
    ...bids.map((bid) => ({ ...bid, type: "bid" })),
    ...asks.map((ask) => ({ ...ask, type: "ask" })),
  ].sort((a, b) => a.price.toNumber() - b.price.toNumber())

  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]
  const midPrice = React.useMemo(() => {
    if (!bids?.length || !asks?.length) return initialMidPrice
    return Big(lowestAsk?.price ?? 0)
      .add(highestBid?.price ?? 0)
      .div(2)
      .toNumber()
  }, [
    asks?.length,
    bids?.length,
    highestBid?.price,
    initialMidPrice,
    lowestAsk?.price,
  ])
  const xLowerBound = midPrice ? midPrice * 0.7 : 0 // 30% lower than mid price
  const xUpperBound = midPrice ? midPrice * 1.3 : 6000 // 30% higher than mid price

  const maxVolume = Math.max(...offers.map((offer) => offer.volume.toNumber()))

  const [xDomain, setXDomain] = React.useState([xLowerBound, xUpperBound])
  const [dragStartPoint, setDragStartPoint] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const [prevPoint, setPrevPoint] = React.useState<{
    x: number
    y: number
  } | null>(null)

  const altPressed = useKeyPress("Alt")

  React.useEffect(() => {
    if (!midPrice) return
    const xLowerBound = midPrice * 0.7 // 30% lower than mid price
    const xUpperBound = midPrice * 1.3 // 30% higher than mid price
    setXDomain([xLowerBound, xUpperBound])
  }, [midPrice])

  const xScale = scaleLinear({
    domain: xDomain,
    range: [0, width - paddingRight],
  })

  const yScale = scaleLinear({
    domain: [0, maxVolume / maxToTheTopRatio],
    range: [height - paddingBottom, 0], // subtract paddingBottom from height
  })

  // used for zoom
  const rescaleXAxis = (zoom: ProvidedZoom<Element>) => {
    const newXDomain = xScale.range().map((r) => {
      return xScale.invert(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX,
      )
    })
    return xScale.copy().domain(newXDomain)
  }

  /**
   * Price range selection
   */
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<
    [number, number] | null
  >(priceRange ?? null)

  React.useEffect(() => {
    if (!priceRange) return
    setSelectedPriceRange(priceRange)
  }, [priceRange])

  const svgRef = React.useRef(null)
  return (
    <Zoom
      width={width}
      height={height}
      scaleXMin={0.1}
      scaleXMax={40}
      initialTransformMatrix={initialTransform}
    >
      {(zoom) => {
        const xScaleTransformed = rescaleXAxis(zoom)
        return (
          <>
            <div className="flex justify-between py-6">
              <Title variant={"title1"}>Price range</Title>
              <span className="flex space-x-3">
                <Button
                  variant={"tertiary"}
                  size={"icon"}
                  className="w-8 h-8"
                  onClick={() => {
                    zoom.scale({ scaleX: 1.1 })
                  }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant={"tertiary"}
                  size={"icon"}
                  className="w-8 h-8"
                  onClick={() => zoom.scale({ scaleX: 0.9 })}
                  disabled={isLoading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </span>
            </div>
            <div
              className="w-full h-96 bg-[#041010] rounded-lg relative"
              ref={ref}
            >
              {altPressed && (
                <div
                  className={cn("absolute inset-0 cursor", {
                    "!cursor-grab": altPressed,
                    "!cursor-grabbing": altPressed && zoom.isDragging,
                  })}
                  onMouseMove={(e) => {
                    // Get the minimum value of the domain
                    const [minDomain] = xScaleTransformed.domain()

                    // If there's no minimum domain value or no drag start point, exit the function
                    if (!minDomain || !dragStartPoint) return

                    // Get the current mouse position
                    const currentPoint = localPoint(e) ?? { x: 0, y: 0 }

                    // Determine the direction of the drag
                    let dragDirection = "none"
                    if (prevPoint) {
                      dragDirection =
                        currentPoint.x < prevPoint.x ? "right" : "left"
                    }

                    // Update the previous mouse position
                    setPrevPoint(currentPoint)

                    // If the minimum domain value is greater than 0, allow dragging in both directions
                    if (minDomain > 0) {
                      zoom.dragMove(e)
                    }
                    // If the minimum domain value is less than or equal to 0, only allow dragging to the right
                    else if (minDomain <= 0 && dragDirection === "right") {
                      zoom.dragMove(e)
                    }
                  }}
                  onMouseDown={(e) => {
                    const point = localPoint(e) ?? { x: 0, y: 0 }
                    setDragStartPoint(point)
                    zoom.dragStart(e)
                  }}
                  onMouseUp={zoom.dragEnd}
                  onMouseOut={zoom.dragEnd}
                />
              )}
              {isLoading && <Skeleton className="h-full w-full" />}
              <svg
                className={cn("w-full h-full", {
                  hidden: isLoading,
                })}
                ref={svgRef}
              >
                <BackgroundRectangles
                  height={height}
                  paddingBottom={paddingBottom}
                  xScale={xScaleTransformed}
                  priceRange={priceRange}
                  midPrice={midPrice}
                />
                <AreaClosed
                  data={offers}
                  x={(d) => xScaleTransformed(d.price.toNumber())}
                  y={(d) => yScale(d.volume.toNumber())}
                  yScale={yScale}
                  strokeWidth={1}
                  curve={curveStep}
                  className="fill-primary-night-woods"
                />
                <AxisTop
                  top={height}
                  scale={xScaleTransformed}
                  numTicks={8}
                  hideAxisLine
                  hideTicks
                  tickClassName="!stroke-gray-scale-300 !select-none"
                />
                <AxisLeft
                  left={width}
                  scale={yScale}
                  numTicks={3}
                  hideAxisLine
                  hideTicks
                  tickClassName="!stroke-gray-scale-300 !select-none"
                  tickComponent={({ formattedValue, ...tickProps }) => {
                    return (
                      <g>
                        <line
                          x1={-width}
                          x2={-paddingRight}
                          y1={tickProps.y}
                          y2={tickProps.y}
                          className="stroke-white opacity-[.06]"
                        />
                        <text
                          {...tickProps}
                          fill="white"
                          fontFamily="Your Font Family"
                        >
                          {formattedValue}
                        </text>
                      </g>
                    )
                  }}
                />
                <CustomBrush
                  xScale={xScaleTransformed}
                  width={width - paddingRight}
                  height={height - paddingBottom}
                  onBrushEnd={(selectedRange) => {
                    setSelectedPriceRange(selectedRange)
                    if (onPriceRangeChange && selectedRange) {
                      onPriceRangeChange(selectedRange)
                    }
                  }}
                  onBrushChange={(selectedRange) => {
                    setSelectedPriceRange(selectedRange)
                    if (onPriceRangeChange && selectedRange) {
                      onPriceRangeChange(selectedRange)
                    }
                  }}
                  value={selectedPriceRange ?? undefined}
                  svgRef={svgRef}
                  viewOnly={viewOnly}
                  midPrice={midPrice}
                />
                {priceRange?.[0] && priceRange?.[1] && (
                  <GeometricKandelDistributionDots
                    height={height}
                    paddingBottom={paddingBottom}
                    xScale={xScaleTransformed}
                    geometricKandelDistribution={geometricKandelDistribution}
                  />
                )}
              </svg>
              {selectedPriceRange && (
                <RangeTooltips
                  height={height}
                  paddingBottom={paddingBottom}
                  xScale={xScaleTransformed}
                  selectedPriceRange={selectedPriceRange}
                  midPrice={midPrice}
                />
              )}
            </div>
          </>
        )
      }}
    </Zoom>
  )
}
