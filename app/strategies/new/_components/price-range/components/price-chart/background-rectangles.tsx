"use client"
import { LinearGradient } from "@visx/gradient"
import type { ScaleLinear } from "d3-scale"
import React from "react"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  initialPriceRange?: [number, number] | null
  midPrice: number | null
}

export function BackgroundRectangles({
  height,
  paddingBottom,
  xScale: xScaleTransformed,
  initialPriceRange,
  midPrice,
}: Props) {
  const bidsGradientId = React.useId()
  const asksGradientId = React.useId()
  const neutralGradientId = React.useId()

  const minPrice = initialPriceRange ? initialPriceRange[0] : null
  const maxPrice = initialPriceRange ? initialPriceRange[1] : null

  const leftBidBound =
    minPrice && midPrice && minPrice < midPrice ? minPrice : midPrice
  const rightBidBound =
    maxPrice && midPrice && maxPrice > midPrice ? midPrice : maxPrice

  const leftAskBound =
    minPrice && midPrice && minPrice < midPrice ? midPrice : minPrice
  const rightAskBound =
    maxPrice && midPrice && maxPrice > midPrice ? maxPrice : midPrice

  return (
    <>
      {initialPriceRange && midPrice ? (
        <>
          {leftBidBound && rightBidBound && (
            <>
              <LinearGradient
                id={bidsGradientId}
                from={"rgba(3, 98, 76, 0.00)"}
                to={"rgba(11, 69, 58, 0.50)"}
              />
              <rect
                x={xScaleTransformed(leftBidBound)}
                y={0}
                width={
                  xScaleTransformed(rightBidBound) -
                  xScaleTransformed(leftBidBound)
                }
                height={height - paddingBottom}
                fill={`url(#${bidsGradientId})`}
              />
            </>
          )}
          {leftAskBound && rightAskBound && (
            <>
              <LinearGradient
                id={asksGradientId}
                from={"rgba(255, 92, 92, 0.00)"}
                to={"rgba(255, 75, 75, 0.50)"}
              />
              <rect
                x={xScaleTransformed(leftAskBound)}
                y={0}
                width={
                  xScaleTransformed(rightAskBound) -
                  xScaleTransformed(leftAskBound)
                }
                height={height - paddingBottom}
                fill={`url(#${asksGradientId})`}
              />
            </>
          )}
        </>
      ) : (
        initialPriceRange && (
          <>
            <LinearGradient
              id={neutralGradientId}
              from={"rgba(3, 98, 76, 0.00)"}
              to={"rgba(11, 69, 58, 0.50)"}
            />
            <rect
              x={xScaleTransformed(initialPriceRange[1])}
              y={0}
              width={
                xScaleTransformed(midPrice ?? 0) -
                xScaleTransformed(initialPriceRange[1])
              }
              height={height - paddingBottom}
              fill={`url(#${neutralGradientId})`}
            />
          </>
        )
      )}
    </>
  )
}
