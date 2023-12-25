import { type ScaleLinear } from "d3-scale"
import { useEffect, useRef, useState } from "react"

interface CustomBrushProps {
  xScale: ScaleLinear<number, number>
  width: number
  height: number
  onBrushEnd: (range: [number, number]) => void
  value?: [number, number]
}

function CustomBrush({
  xScale,
  width,
  height,
  onBrushEnd,
  value,
}: CustomBrushProps) {
  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const rectRef = useRef<SVGRectElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (event: MouseEvent) => {
    const rect = rectRef.current
    if (rect) {
      const svgRect = rect.getBoundingClientRect()
      let xPixel = event.clientX - svgRect.left
      // Ensure xPixel is within the range of the SVG
      xPixel = Math.max(0, Math.min(width, xPixel))
      const x = xScale.invert(xPixel)
      console.log(
        "clientX:",
        event.clientX,
        "svgRect.left:",
        svgRect.left,
        "xPixel:",
        xPixel,
        "x:",
        x,
        "xScale(x):",
        xScale.domain(),
        xScale.range(),
      )
      setStart(x)
      setEnd(x)
      setDragging(true)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (start !== null && dragging) {
      const rect = rectRef.current
      if (rect) {
        const svgRect = rect.getBoundingClientRect()
        const x = xScale.invert(event.clientX - svgRect.left)
        setEnd(x)
      }
    }
  }

  const handleMouseUp = () => {
    if (start !== null && end !== null && onBrushEnd) {
      const lowest = Math.min(start, end)
      const highest = Math.max(start, end)
      onBrushEnd([lowest, highest])
    }
    if (!value) {
      // only reset start and end if value is not provided
      setStart(null)
      setEnd(null)
    }
    setDragging(false)
  }

  useEffect(() => {
    const rect = rectRef.current
    if (rect) {
      rect.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      if (rect) {
        rect.removeEventListener("mousedown", handleMouseDown)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [start, end])

  const brushWidth = value
    ? Math.abs(xScale(value[1]) - xScale(value[0]))
    : start && end
      ? Math.abs(xScale(end) - xScale(start))
      : 0
  const brushX = value
    ? Math.min(xScale(value[0]), xScale(value[1]))
    : start && end
      ? Math.min(xScale(start), xScale(end))
      : 0

  return (
    <>
      <rect ref={rectRef} width={width} height={height} fill="transparent" />
      {start && end && (
        <rect
          x={brushX}
          y={0}
          width={brushWidth}
          height={height}
          fill="rgba(255, 0, 0, 0.1)"
        />
      )}
    </>
  )
}

export default CustomBrush
