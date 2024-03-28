import { cn } from "@/utils"
import { calculatePriceDifferencePercentage } from "@/utils/numbers"
import { Tooltip } from "@visx/tooltip"
import type { ScaleLinear } from "d3-scale"

type Props = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  selectedPriceRange?: [number, number] | null
  midPrice?: number | null
}

export function RangeTooltips({
  height,
  paddingBottom,
  xScale: xScaleTransformed,
  selectedPriceRange,
  midPrice,
}: Props) {
  const [min, max] = selectedPriceRange ?? [0, 0]

  const minColor = !midPrice ? "neutral" : midPrice > min ? "green" : "red"
  const maxColor = !midPrice ? "neutral" : midPrice < max ? "red" : "green"

  return (
    <>
      {min && max ? (
        <>
          <RangeTooltip
            color={minColor}
            height={height}
            paddingBottom={paddingBottom}
            text="Min"
            value={min}
            xScale={xScaleTransformed}
            midPrice={midPrice}
          />
          <RangeTooltip
            color={maxColor}
            height={height}
            paddingBottom={paddingBottom}
            text="Max"
            value={max}
            xScale={xScaleTransformed}
            midPrice={midPrice}
          />
        </>
      ) : undefined}
      {midPrice ? (
        <Tooltip
          top={0}
          left={xScaleTransformed(midPrice)}
          className="!bg-transparent"
        >
          <div
            className={cn(
              "whitespace-nowrap -translate-x-2/3 px-2 py-1 rounded-md text-sm leading-[14px] bg-cloud-400 text-white",
            )}
          >
            Mid {midPrice.toFixed(2)}
          </div>
        </Tooltip>
      ) : undefined}
    </>
  )
}

type RangeTooltipProps = {
  height: number
  paddingBottom: number
  xScale: ScaleLinear<number, number>
  value: number
  color: "green" | "red" | "neutral"
  text: string
  midPrice?: number | null
}

function RangeTooltip({
  height,
  paddingBottom,
  xScale: xScaleTransformed,
  value,
  color,
  text,
  midPrice,
}: RangeTooltipProps) {
  const percentage = calculatePriceDifferencePercentage({
    price: midPrice,
    value,
  })

  return (
    <Tooltip
      top={height - paddingBottom - 6}
      left={xScaleTransformed(value)}
      className="!bg-transparent"
    >
      <div
        className={cn(
          "whitespace-nowrap -translate-x-2/3 px-2 py-1 rounded-md text-sm leading-[14px]",
          {
            "!bg-cherry-400 !text-cherry-100": color === "red",
            "!bg-green-bangladesh !text-green-caribbean":
              color === "green" || color === "neutral",
          },
        )}
      >
        {text} {value.toFixed(2)}{" "}
        {midPrice ? `${percentage.toFixed(2)}% filled` : ""}
      </div>
    </Tooltip>
  )
}
