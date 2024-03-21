"use client"
import { LinearGradient } from "@visx/gradient"
import type { ScaleLinear } from "d3-scale"
import React from "react"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  priceRange?: [number, number] | null
  midPrice?: number | null
}

function isPositiveNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && value > 0
}

export function BackgroundRectangles({
  height,
  paddingBottom,
  xScale: xScaleTransformed,
  priceRange,
  midPrice,
}: Props) {
  const bidsGradientId = React.useId()
  const asksGradientId = React.useId()
  const neutralGradientId = React.useId()

  const minPrice = priceRange ? priceRange[0] : null
  const maxPrice = priceRange ? priceRange[1] : null

  const leftBidBound =
    minPrice && midPrice && minPrice < midPrice ? minPrice : midPrice
  const rightBidBound =
    maxPrice && midPrice && maxPrice > midPrice ? midPrice : maxPrice

  const leftAskBound =
    minPrice && midPrice && minPrice < midPrice ? midPrice : minPrice
  const rightAskBound =
    maxPrice && midPrice && maxPrice > midPrice ? maxPrice : midPrice

  const rectHeight = height - paddingBottom

  const leftX = leftBidBound && xScaleTransformed(leftBidBound)
  const rightX = rightBidBound && xScaleTransformed(rightBidBound)

  if (!(leftX && rightX && isPositiveNumber(rectHeight))) return null

  return (
    <>
      {priceRange && midPrice ? (
        <>
          <LinearGradient
            id={bidsGradientId}
            from={"rgba(3, 98, 76, 0.00)"}
            to={"rgba(11, 69, 58, 0.50)"}
          />
          <rect
            x={leftX}
            y={0}
            width={rightX - leftX}
            height={rectHeight}
            fill={`url(#${bidsGradientId})`}
          />
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
                height={rectHeight}
                fill={`url(#${asksGradientId})`}
              />
            </>
          )}
        </>
      ) : (
        minPrice &&
        maxPrice && (
          <>
            <LinearGradient
              id={neutralGradientId}
              from={"rgba(3, 98, 76, 0.00)"}
              to={"rgba(11, 69, 58, 0.50)"}
              opacity={0.05}
            />
            <rect
              x={xScaleTransformed(minPrice)}
              y={0}
              width={xScaleTransformed(maxPrice) - xScaleTransformed(minPrice)}
              height={height - paddingBottom}
              fill={`url(#${neutralGradientId})`}
            />
          </>
        )
      )}
    </>
  )
}
