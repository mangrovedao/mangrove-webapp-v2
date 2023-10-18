import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart"

type Data = { x: string; y: number }

const data1: Data[] = [
  { x: "2020-01-01", y: 50 },
  { x: "2020-01-02", y: 10 },
  { x: "2020-01-03", y: 20 },
]

const data2: Data[] = [
  { x: "2020-01-01", y: 30 },
  { x: "2020-01-02", y: 40 },
  { x: "2020-01-03", y: 80 },
]

const accessors = {
  xAccessor: (d: Data | undefined) => d?.x,
  yAccessor: (d: Data | undefined) => d?.y,
}

export default function DepthChart() {
  return (
    <XYChart
      height={800}
      width={800}
      xScale={{ type: "band" }}
      yScale={{ type: "linear" }}
    >
      <AnimatedAxis orientation="bottom" />
      <AnimatedGrid columns={false} numTicks={4} />
      <AnimatedLineSeries dataKey="Line 1" data={data1} {...accessors} />
      <AnimatedLineSeries dataKey="Line 2" data={data2} {...accessors} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
          <div>
            <div
              style={{
                color: colorScale?.(
                  tooltipData?.nearestDatum?.key ?? "transparent",
                ),
              }}
            >
              {tooltipData?.nearestDatum?.key ?? "transparent"}
            </div>
          </div>
        )}
      />
    </XYChart>
  )
}
