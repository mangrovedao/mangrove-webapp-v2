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
  const startValueRef = useRef<number | null>(null)
  const [selection, setSelection] = useState<[number, number] | null>(null)
  const rectRef = useRef<SVGRectElement | null>(null)

  const handleMouseDown = (event: MouseEvent) => {
    const rect = rectRef.current
    if (rect) {
      const svgRect = rect.getBoundingClientRect()
      let xPixel = event.clientX - svgRect.left
      xPixel = Math.max(0, Math.min(width, xPixel))
      const x = xScale.invert(xPixel)
      startValueRef.current = x
      setSelection([x, x])
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (startValueRef.current !== null) {
      const rect = rectRef.current
      if (rect) {
        const svgRect = rect.getBoundingClientRect()
        const xPixel = event.clientX - svgRect.left
        const x = xScale.invert(xPixel)
        setSelection([startValueRef.current, x])
      }
    }
  }

  const handleMouseUp = () => {
    if (selection !== null && onBrushEnd) {
      onBrushEnd(selection.sort((a, b) => a - b) as [number, number])
    }
    startValueRef.current = null
    setSelection(null)
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
  }, [selection])

  const brushWidth = selection
    ? Math.abs(xScale(selection[1]) - xScale(selection[0]))
    : 0
  const brushX = selection
    ? Math.min(xScale(selection[0]), xScale(selection[1]))
    : 0

  return (
    <>
      <rect ref={rectRef} width={width} height={height} fill="transparent" />
      {selection && (
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
