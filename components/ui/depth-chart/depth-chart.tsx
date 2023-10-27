/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"
import { LinearGradient } from "@visx/gradient"
import {
  AreaSeries,
  Axis,
  DataProvider,
  EventEmitterProvider,
  Grid,
  LineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart"

import { lerp } from "@/utils/interpolation"
import { curveStepAfter, curveStepBefore } from "@visx/curve"
import Big from "big.js"
import { Skeleton } from "../skeleton"
import { DataKeyType } from "./enums"
import { type Offer } from "./schema"
import {
  borderVar,
  borderWidthVar,
  crosshairStyle,
  greenColorVar,
  redColorVar,
  theme,
} from "./theme"
import { useDepthChart } from "./use-depth-chart"
import { formatNumber, toNumberIfBig } from "./utils"

const accessors = {
  xAccessor: (offer: Offer) => toNumberIfBig(offer.price),
  yAccessor: (offer: Offer) => toNumberIfBig(offer.volume),
}

export declare enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export default function DepthChart() {
  const {
    cumulativeAsks,
    cumulativeBids,
    domain,
    midPrice,
    onDepthChartZoom,
    range,
    zoomDomain,
    highestAsk,
    lowestAsk,
    highestBid,
    lowestBid,
  } = useDepthChart()

  if (!(zoomDomain && midPrice)) {
    return <Skeleton className="w-full h-full" />
  }

  return (
    <div
      className="w-full h-full overflow-hidden select-none cursor-crosshair"
      onWheel={onDepthChartZoom}
    >
      <DataProvider
        theme={theme}
        xScale={{
          type: "linear",
          clamp: false,
          nice: false,
          zero: false,
          domain: [lerp(...domain, -0.02), lerp(...domain, 1.02)],
        }}
        yScale={{
          type: "linear",
          clamp: true,
          nice: true,
          zero: true,
          domain: [range[0], lerp(...range, 1.1)],
        }}
      >
        <EventEmitterProvider>
          <XYChart
            // @ts-ignore
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 32,
            }}
          >
            <Axis
              orientation="bottom"
              numTicks={8}
              tickFormat={(n) => formatNumber(n, zoomDomain >= 500)}
            />
            <Grid
              numTicks={4}
              lineStyle={{
                stroke: borderVar,
                strokeWidth: borderWidthVar,
              }}
            />

            {[
              {
                dataKey: DataKeyType.BIDS,
                data: cumulativeBids.length
                  ? [
                      { ...highestBid, volume: Big(0) },
                      ...cumulativeBids,
                    ].reverse()
                  : [],
                color: greenColorVar,
                curve: curveStepBefore,
              },
              {
                dataKey: DataKeyType.ASKS,
                data: cumulativeAsks.length
                  ? [{ ...lowestAsk, volume: Big(0) }, ...cumulativeAsks]
                  : [],
                color: redColorVar,
                curve: curveStepAfter,
              },
            ].map((props) => (
              <g key={`${props.dataKey}-group`}>
                <AreaSeries
                  {...props}
                  xAccessor={(offer: Partial<Offer>) =>
                    Big(offer?.price ?? 0).toNumber()
                  }
                  yAccessor={(offer: Partial<Offer>) =>
                    Big(offer?.volume ?? 0).toNumber()
                  }
                  lineProps={{ strokeWidth: 1 }}
                  fillOpacity={0.15}
                  fill={`url(#${props.dataKey}-gradient)`}
                  renderLine={true}
                />
                <LinearGradient
                  id={`${props.dataKey}-gradient`}
                  from={props.color}
                  to={props.color}
                  toOpacity={0.35}
                />
              </g>
            ))}
            <LineSeries
              dataKey={DataKeyType.MID_PRICE}
              data={[1.2, 0.5, 0].map((volumeMultiplier) => ({
                price: midPrice,
                volume: lerp(...range, volumeMultiplier),
              }))}
              xAccessor={(x) => x?.price.toNumber()}
              yAccessor={(x) => x?.volume}
              strokeWidth={0.25}
            />
            <Tooltip<Offer>
              unstyled
              applyPositionStyle
              snapTooltipToDatumX
              snapTooltipToDatumY
              showHorizontalCrosshair
              showVerticalCrosshair
              verticalCrosshairStyle={crosshairStyle}
              horizontalCrosshairStyle={crosshairStyle}
              renderTooltip={({ tooltipData, colorScale }) => {
                if (
                  !(
                    tooltipData?.nearestDatum &&
                    tooltipData?.nearestDatum.datum &&
                    colorScale
                  )
                )
                  return

                const color = colorScale(tooltipData.nearestDatum.key)
                return (
                  <div>
                    <div style={{ color }}>{tooltipData.nearestDatum.key}</div>
                    {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                    {", "}
                    {accessors.yAccessor(tooltipData.nearestDatum.datum)}
                  </div>
                )
              }}
            />
          </XYChart>
        </EventEmitterProvider>
      </DataProvider>
    </div>
  )
}
