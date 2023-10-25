"use client"
import { LinearGradient } from "@visx/gradient"
import {
  AreaSeries,
  Axis,
  DataProvider,
  Grid,
  LineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart"

import { lerp } from "@/utils/interpolation"
import { curveStepAfter } from "@visx/curve"
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

export default function DepthChart() {
  const {
    cumulativeAsks,
    cumulativeBids,
    domain,
    midPrice,
    onDepthChartZoom,
    range,
    zoomDomain,
  } = useDepthChart()
  if (
    !(zoomDomain && midPrice && cumulativeAsks.length && cumulativeBids.length)
  ) {
    return <div>Loading...</div>
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
        <XYChart
          margin={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 32,
          }}
        >
          <Axis
            orientation="bottom"
            numTicks={5}
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
              data: cumulativeBids,
              color: greenColorVar,
            },
            {
              dataKey: DataKeyType.ASKS,
              data: cumulativeAsks,
              color: redColorVar,
            },
          ].map((props) => (
            <>
              <AreaSeries
                {...props}
                key={`${props.dataKey}-area`}
                xAccessor={(offer: Offer) => offer?.price.toNumber()}
                yAccessor={(offer: Offer) => offer?.volume.toNumber()}
                curve={curveStepAfter}
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
            </>
          ))}
          <LineSeries
            dataKey={DataKeyType.MID_PRICE}
            data={[1.2, 0.5, -0.1].map((volumeMultiplier) => ({
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

              return (
                <div>
                  <div
                    style={{
                      color: colorScale(tooltipData.nearestDatum.key),
                    }}
                  >
                    {tooltipData.nearestDatum.key}
                  </div>
                  {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                  {", "}
                  {accessors.yAccessor(tooltipData.nearestDatum.datum)}
                </div>
              )
            }}
          />
        </XYChart>
      </DataProvider>
    </div>
  )
}
