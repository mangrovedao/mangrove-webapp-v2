"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import { AxisLeft, AxisTop } from "@visx/axis"
import { curveStep } from "@visx/curve"
import { scaleLinear } from "@visx/scale"
import { AreaClosed } from "@visx/shape"
import { Zoom } from "@visx/zoom"
import Big from "big.js"
import { Minus, Plus } from "lucide-react"
import React from "react"
import useResizeObserver from "use-resize-observer"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { ProvidedZoom } from "@visx/zoom/lib/types"

// const [width, height] = [911, 384]
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

type Props = {
  bids?: Market.Offer[]
  asks?: Market.Offer[]
  onPriceRangeChange?: (priceRange: number[]) => void
}

export function PriceRangeChart({
  bids = [],
  asks = [],
  onPriceRangeChange,
}: Props) {
  const { ref, width = 0, height = 0 } = useResizeObserver()
  const offers = [
    ...bids.map((bid) => ({ ...bid, type: "bid" })),
    ...asks.map((ask) => ({ ...ask, type: "ask" })),
  ].sort((a, b) => a.price.toNumber() - b.price.toNumber())

  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]
  const lowestBid = bids?.[bids.length - 1]
  const highestAsk = asks?.[asks.length - 1]
  const midPrice = React.useMemo(() => {
    if (!bids?.length || !asks?.length) return 0.1 // set a minimum value for midPrice
    return Big(lowestAsk?.price ?? 0)
      .add(highestBid?.price ?? 0)
      .div(2)
      .toNumber()
  }, [asks?.length, bids?.length, highestBid?.price, lowestAsk?.price])
  const xLowerBound = midPrice * 0.7 // 30% lower than mid price
  const xUpperBound = midPrice * 1.3 // 30% higher than mid price

  const min = bids.length ? lowestBid : lowestAsk
  const max = asks.length ? highestAsk : highestBid
  const minPrice = min?.price.toNumber() ?? 0
  const maxPrice = max?.price.toNumber() ?? 0
  const maxVolume = Math.max(...offers.map((offer) => offer.volume.toNumber()))

  const [xDomain, setXDomain] = React.useState([xLowerBound, xUpperBound])

  React.useEffect(() => {
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

  return (
    <Zoom
      width={width}
      height={height}
      scaleXMin={0.1}
      scaleXMax={40}
      initialTransformMatrix={{
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        skewX: 0,
        skewY: 0,
      }}
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant={"tertiary"}
                  size={"icon"}
                  className="w-8 h-8"
                  onClick={() => zoom.scale({ scaleX: 0.9 })}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </span>
            </div>
            <div className="w-full h-96 bg-[#041010] rounded-lg" ref={ref}>
              <svg
                className="w-full h-full"
                onMouseMove={zoom.dragMove}
                onMouseDown={zoom.dragStart}
                onMouseUp={zoom.dragEnd}
                onMouseOut={zoom.dragEnd}
              >
                <AreaClosed
                  data={offers}
                  x={(d) => xScaleTransformed(d.price.toNumber())}
                  y={(d) => yScale(d.volume.toNumber())}
                  yScale={yScale}
                  fill="#010D0D"
                  strokeWidth={1}
                  curve={curveStep}
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
                  numTicks={4}
                  hideAxisLine
                  hideTicks
                  hideZero
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
              </svg>
            </div>
          </>
        )
      }}
    </Zoom>
  )
}
