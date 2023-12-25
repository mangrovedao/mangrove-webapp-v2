"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import { Minus, Plus } from "lucide-react"
import React from "react"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { AxisLeft, AxisTop } from "@visx/axis"
import { curveStep } from "@visx/curve"
import { scaleLinear } from "@visx/scale"
import { AreaClosed } from "@visx/shape"
import Big from "big.js"

const [width, height] = [911, 384]
const paddingRight = 54
const paddingBottom = 44
const maxToTheTopRatio = 0.8

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
  const offers = [
    ...bids.map((bid) => ({ ...bid, type: "bid" })),
    ...asks.map((ask) => ({ ...ask, type: "ask" })),
  ].sort((a, b) => a.price.toNumber() - b.price.toNumber())

  console.log(JSON.stringify(offers, null, 2))
  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]
  const lowestBid = bids?.[bids.length - 1]
  const highestAsk = asks?.[asks.length - 1]
  const midPrice = React.useMemo(() => {
    if (!bids?.length || !asks?.length) return 0
    return Big(lowestAsk?.price ?? 0)
      .add(highestBid?.price ?? 0)
      .div(2)
      .toNumber()
  }, [asks?.length, bids?.length, highestBid?.price, lowestAsk?.price])

  console.log(midPrice.toString())

  const min = bids.length ? lowestBid : lowestAsk
  const max = asks.length ? highestAsk : highestBid
  const minPrice = min?.price.toNumber() ?? 0
  const maxPrice = max?.price.toNumber() ?? 0
  const maxVolume = Math.max(...offers.map((offer) => offer.volume.toNumber()))

  const xScale = scaleLinear({
    domain: [minPrice, maxPrice],
    range: [0, width - paddingRight], // subtract paddingRight from width
  })

  const yScale = scaleLinear({
    domain: [0, maxVolume / maxToTheTopRatio],
    range: [height - paddingBottom, 0], // subtract paddingBottom from height
  })

  return (
    <>
      <div className="flex justify-between py-6">
        <Title variant={"title1"}>Price range</Title>
        <span className="flex space-x-3">
          <Button variant={"tertiary"} size={"icon"} className="w-8 h-8">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant={"tertiary"} size={"icon"} className="w-8 h-8">
            <Minus className="h-4 w-4" />
          </Button>
        </span>
      </div>
      <div className="w-full h-96 bg-[#041010] rounded-lg">
        <svg className="w-full h-full">
          <AreaClosed
            data={offers}
            x={(d) => xScale(d.price.toNumber())}
            y={(d) => yScale(d.volume.toNumber())}
            yScale={yScale}
            // fill="gray"
            fill="#010D0D"
            strokeWidth={1}
            curve={curveStep}
          />
          <AxisTop
            top={height}
            scale={xScale}
            numTicks={8}
            hideAxisLine
            hideTicks
            tickClassName="!stroke-gray-scale-300"
          />
          <AxisLeft
            left={width}
            scale={yScale}
            numTicks={4}
            hideAxisLine
            hideTicks
            hideZero
            tickClassName="!stroke-gray-scale-300"
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
}
