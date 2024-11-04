"use client"

import { curveStepAfter, curveStepBefore } from "@visx/curve"
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

import { Skeleton } from "@/components/ui/skeleton"
import { lerp } from "@/utils/interpolation"
import { CompleteOffer } from "@mangrovedao/mgv"
import { DataKeyType } from "./enums"
import {
  borderVar,
  borderWidthVar,
  crosshairStyle,
  greenColorVar,
  redColorVar,
  theme,
} from "./theme"
import { useDepthChart } from "./use-depth-chart"
import {
  formatNumber,
  getNumTicksBasedOnDecimals,
  toNumberIfBig,
} from "./utils"

const accessors = {
  xAccessor: (offer: CompleteOffer) => toNumberIfBig(offer.price),
  yAccessor: (offer: CompleteOffer) => toNumberIfBig(offer.volume),
}

export function DepthChart() {
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
    isScrolling,
    onMouseOut,
    onMouseOver,
    onMouseMove,
    baseDecimals,
    priceDecimals,
    market,
    asks,
    bids,
    isLoading,
  } = useDepthChart()

  if (asks?.length === 0 && bids?.length === 0 && !isLoading && !!market) {
    return (
      <div className="w-full h-full flex justify-center items-center text-muted-foreground font-ubuntu text-sm font-bold">
        Empty market.
      </div>
    )
  }

  if (isLoading) {
    return (
      <Skeleton className="w-full h-full flex justify-center items-center text-green-caribbean" />
    )
  }

  return (
    <div
      className="w-full h-full overflow-hidden select-none cursor-crosshair relative"
      onWheel={onDepthChartZoom}
      onMouseOut={onMouseOut}
      onMouseOver={onMouseOver}
      onMouseMove={onMouseMove}
    >
      <div className="absolute inset-0">
        <DataProvider
          theme={theme}
          xScale={{
            type: "log",
            clamp: false,
            nice: false,
            zero: false,
            domain: [
              lerp(domain[0], domain[1], 0.01),
              lerp(domain[0], domain[1], 1),
            ],
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
              margin={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 16,
              }}
            >
              {zoomDomain ? (
                <Axis
                  orientation="bottom"
                  numTicks={getNumTicksBasedOnDecimals(zoomDomain)}
                  tickFormat={(n) => formatNumber(n, zoomDomain >= 500)}
                />
              ) : undefined}
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
                        { ...highestBid, volume: 0 },
                        ...cumulativeBids,
                        { price: 0, volume: 0 },
                      ].reverse()
                    : [],
                  color: greenColorVar,
                  curve: curveStepBefore,
                },
                {
                  dataKey: DataKeyType.ASKS,
                  data: cumulativeAsks.length
                    ? [{ ...lowestAsk, volume: 0 }, ...cumulativeAsks]
                    : [],
                  color: redColorVar,
                  curve: curveStepAfter,
                },
              ].map((props) => (
                <g key={`${props.dataKey}-group`}>
                  <AreaSeries
                    {...props}
                    xAccessor={(offer: Partial<CompleteOffer>) =>
                      offer?.price ?? 0
                    }
                    yAccessor={(offer: Partial<CompleteOffer>) =>
                      offer?.volume ?? 0
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
                xAccessor={(x) => x?.price}
                yAccessor={(x) => x?.volume}
                strokeWidth={0.25}
              />
              {!isScrolling && (
                <Tooltip<CompleteOffer>
                  detectBounds={true}
                  applyPositionStyle
                  snapTooltipToDatumX
                  snapTooltipToDatumY
                  showHorizontalCrosshair
                  showVerticalCrosshair
                  verticalCrosshairStyle={crosshairStyle}
                  horizontalCrosshairStyle={crosshairStyle}
                  style={{
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

                    const id = tooltipData?.nearestDatum?.datum.id
                    if (!id) return

                    const key = tooltipData.nearestDatum.key
                    const color = colorScale(key)
                    const price = accessors.xAccessor(
                      tooltipData.nearestDatum.datum,
                    )
                    const volume = accessors.yAccessor(
                      tooltipData.nearestDatum.datum,
                    )
                    const [min, max] = domain
                    const isOutside = price < min || price > max
                    if (
                      (key !== DataKeyType.MID_PRICE.toString() &&
                        (!price || !volume)) ||
                      isOutside
                    )
                      return

                    // Do not show tooltip for midPrice if there is no asks or bids, cause midPrice would be 0 in that case
                    if (
                      key === DataKeyType.MID_PRICE.toString() &&
                      (!cumulativeAsks?.length || !cumulativeBids?.length)
                    ) {
                      return
                    }

                    return (
                      <div className="bg-gray-scale-500 rounded-lg px-2 py-1 text-xs">
                        {price ? (
                          <div>
                            <span className="text-gray-scale-200">
                              {key !== DataKeyType.MID_PRICE.toString()
                                ? "Price"
                                : "Mid price"}
                              :
                            </span>{" "}
                            {price.toFixed(priceDecimals)}{" "}
                            {market?.quote.symbol}
                          </div>
                        ) : undefined}
                        {key !== DataKeyType.MID_PRICE.toString() && (
                          <div>
                            <b className="capitalize" style={{ color }}>
                              {key.slice(0, -1)}:
                            </b>{" "}
                            <span>
                              {volume.toFixed(baseDecimals)}{" "}
                              {market?.base.symbol}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              )}
            </XYChart>
          </EventEmitterProvider>
        </DataProvider>
      </div>
    </div>
  )
}
