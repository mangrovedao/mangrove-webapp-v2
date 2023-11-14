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

type Props = {
  baseDecimals?: number
  quoteDecimals?: number
  baseSymbol?: string
  quoteSymbol?: string
}
export default function DepthChart({
  baseDecimals = 3,
  quoteDecimals = 4,
  baseSymbol = "WBTC",
  quoteSymbol = "USDT",
}: Props) {
  const {
    cumulativeAsks,
    cumulativeBids,
    domain,
    midPrice,
    onDepthChartZoom,
    range,
    zoomDomain,
    lowestAsk,
    highestBid,
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
              detectBounds={true}
              applyPositionStyle
              snapTooltipToDatumX
              snapTooltipToDatumY
              showHorizontalCrosshair
              showVerticalCrosshair
              verticalCrosshairStyle={crosshairStyle}
              horizontalCrosshairStyle={crosshairStyle}
              style={{
                opacity: 1,
                zIndex: 999,
              }}
              showDatumGlyph={true}
              renderTooltip={({ tooltipData, colorScale }) => {
                if (
                  !(
                    tooltipData?.nearestDatum &&
                    tooltipData?.nearestDatum.datum &&
                    colorScale
                  )
                )
                  return

                const key = tooltipData.nearestDatum.key
                const color = colorScale(key)
                const price = accessors.xAccessor(
                  tooltipData.nearestDatum.datum,
                )
                const volume = accessors.yAccessor(
                  tooltipData.nearestDatum.datum,
                )
                return (
                  <div className="border bg-black p-4 rounded-md">
                    {price ? (
                      <div>
                        <b>Price:</b> {price.toFixed(quoteDecimals)}{" "}
                        {quoteSymbol}
                      </div>
                    ) : undefined}
                    {key !== DataKeyType.MID_PRICE.toString() && (
                      <div>
                        <b style={{ color }}>{key}:</b>{" "}
                        <span>
                          {volume.toFixed(baseDecimals)} {baseSymbol}
                        </span>
                      </div>
                    )}
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
