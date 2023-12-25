import { type BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle"
import { Group } from "@visx/group"
import Big from "big.js"

type BrushHandleProps = {
  innerHeight: number
  readonly: boolean
  midPrice: Big | undefined
  brushData: {
    brushMaxPrice: number
    brushMinPrice: number
  }
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
} & BrushHandleRenderProps

export default function BrushHandle({
  x,
  isBrushActive,
  className,
  margin,
  readonly,
  innerHeight,
  midPrice,
  brushData,
}: BrushHandleProps) {
  if (!isBrushActive) {
    return null
  }
  let handlePrice = undefined
  if (className.includes("left")) {
    handlePrice = brushData.brushMinPrice
  } else {
    handlePrice = brushData.brushMaxPrice
  }
  const color =
    handlePrice >= (midPrice ?? Big(0)).toNumber() ? "#EB525A" : "#3DD09B"
  const left = x + 3
  return (
    <>
      <Group left={left}>
        <line
          className={className}
          x1="-1"
          y1="0"
          x2="-1"
          y2={innerHeight + margin.top}
          stroke={color}
          strokeWidth="1"
        />
        {!readonly && (
          <g style={{ cursor: "ew-resize" }} fill="none">
            <rect
              x="-18"
              y={innerHeight / 2}
              width="32"
              height="24"
              fill={color}
              rx="6"
            />
          </g>
        )}
      </Group>
      {!readonly && (
        <Group left={left - 18} top={innerHeight / 2}>
          <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            fill="none"
            d="M20 16l4-4-4-4m-8 0l-4 4 4 4"
          ></path>
        </Group>
      )}
    </>
  )
}
