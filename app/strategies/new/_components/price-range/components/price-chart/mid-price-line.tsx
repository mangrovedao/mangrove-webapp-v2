import { type ScaleLinear } from "d3-scale"

type Props = {
  xScale: ScaleLinear<number, number, never>
  midPrice: number | undefined
  height: number
}

export function MidPriceLine({ xScale, midPrice, height }: Props) {
  if (!midPrice) return null
  const xPosition = xScale(midPrice)
  return (
    <line
      x1={xPosition}
      y1={0}
      x2={xPosition}
      y2={height}
      strokeWidth={1}
      strokeDasharray="5, 5"
      className="stroke-cloud-300 opacity-50"
    />
  )
}
