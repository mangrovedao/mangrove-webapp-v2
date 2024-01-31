"use client"

import { cn } from "@/utils"
import { type ScaleLinear } from "d3-scale"
import React from "react"

import Cursor from "./cursor"

type SelectionStatus = "idle" | "start" | "end"

interface CustomBrushProps {
  xScale: ScaleLinear<number, number>
  width: number
  height: number
  onBrushEnd: (range: [number, number]) => void
  value?: [number, number]
  onBrushChange: (newRange: [number, number]) => void
  svgRef: React.RefObject<SVGSVGElement>
  viewOnly?: boolean
  midPrice?: number | null
}

function CustomBrush({
  xScale,
  width,
  height,
  onBrushEnd,
  value,
  onBrushChange,
  svgRef,
  viewOnly = false,
  midPrice,
}: CustomBrushProps) {
  const startValueRef = React.useRef<number | null>(null)
  const [selection, setSelection] = React.useState<[number, number] | null>(
    value ?? null,
  )
  const [selectionStatus, setSelectionStatus] =
    React.useState<SelectionStatus>("idle")
  const [dragging, setDragging] = React.useState(false)
  const [dragMode, setDragMode] = React.useState(false)
  const [cursorMoving, setCursorMoving] = React.useState(false)

  const [min, max] = selection ?? [0, 0]
  const leftCursorColor = !midPrice
    ? "neutral"
    : midPrice > min
      ? "green"
      : "red"
  const rightCursorColor = !midPrice
    ? "neutral"
    : midPrice < max
      ? "red"
      : "green"

  // Update selection when value prop changes
  React.useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selection)) {
      setSelection(value ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, xScale])

  const handleMouseDown = React.useCallback(
    (event: MouseEvent) => {
      if (!event.buttons) return

      const svg = svgRef.current
      if (svg) {
        const svgRect = svg.getBoundingClientRect()
        let xPixel = event.clientX - svgRect.left
        xPixel = Math.max(0, Math.min(width, xPixel))
        const x = xScale.invert(xPixel)
        if (xPixel >= 0 && xPixel <= width) {
          if (selection && x >= selection[0] && x <= selection[1]) {
            setDragging(true)
            setDragMode(true)
            startValueRef.current = x - selection[0]
          } else if (!selection) {
            startValueRef.current = x
            setSelectionStatus("start")
            setSelection([x, x])
            setDragMode(false)
          }
        }
      }
    },
    [selection, svgRef, width, xScale],
  )

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (cursorMoving) return
      const svg = svgRef.current
      if (svg) {
        const svgRect = svg.getBoundingClientRect()
        const xPixel = event.clientX - svgRect.left
        const x = xScale.invert(xPixel)
        if (
          dragging &&
          dragMode &&
          selection &&
          startValueRef.current !== null
        ) {
          const dx = x - startValueRef.current
          const newSelection: React.SetStateAction<[number, number] | null> = [
            dx,
            dx + (selection[1] - selection[0]),
          ]
          setSelection(newSelection) // apply the offset
          onBrushChange(newSelection)
        } else if (
          !dragMode &&
          startValueRef.current !== null &&
          event.buttons !== 0 &&
          selectionStatus !== "end"
        ) {
          setSelection([startValueRef.current, x])
        }
      }
    },
    [
      cursorMoving,
      svgRef,
      xScale,
      dragging,
      dragMode,
      selection,
      selectionStatus,
      onBrushChange,
    ],
  )

  const handleMouseUp = React.useCallback(() => {
    setCursorMoving(false)
    setDragging(false)
    setSelectionStatus("end")
    if (selection !== null && onBrushEnd) {
      onBrushEnd(selection.sort((a, b) => a - b) as [number, number])
    }
  }, [onBrushEnd, selection])

  const handleCursorMove = (type: "left" | "right", newPrice: number) => {
    setCursorMoving(true)
    if (!selection) return
    if (type === "left") {
      const newSelection: [number, number] = [newPrice, selection[1]]
      setSelection(newSelection)
      onBrushChange(newSelection)
    } else {
      const newSelection: [number, number] = [selection[0], newPrice]
      setSelection(newSelection)
      onBrushChange(newSelection)
    }
  }

  React.useEffect(() => {
    if (viewOnly) return
    const svg = svgRef.current
    svg?.addEventListener("mousedown", handleMouseDown)
    svg?.addEventListener("mousemove", handleMouseMove)
    svg?.addEventListener("mouseup", handleMouseUp)

    return () => {
      svg?.removeEventListener("mousedown", handleMouseDown)
      svg?.removeEventListener("mousemove", handleMouseMove)
      svg?.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, svgRef, viewOnly])

  const brushWidth = selection
    ? Math.abs(xScale(selection[1]) - xScale(selection[0]))
    : 0
  const brushX = selection
    ? Math.min(xScale(selection[0]), xScale(selection[1]))
    : 0

  const leftCursorPos = selection ? xScale(selection[0]) : 0
  const rightCursorPos = selection ? xScale(selection[1]) : 0

  return (
    <>
      {selection && (
        <rect
          x={isNaN(brushX) ? 0 : brushX}
          y={0}
          width={isNaN(brushWidth) ? 0 : brushWidth}
          height={isNaN(height) ? 0 : height}
          className={cn("opacity-10", {
            "fill-green-bangladesh": selectionStatus === "start",
            "fill-transparent": selectionStatus === "end",
            "cursor-grab": !dragging && !viewOnly,
            "cursor-grabbing": dragging && !viewOnly,
          })}
        />
      )}
      {selection && (
        <>
          <Cursor
            height={height}
            xPosition={leftCursorPos}
            color={leftCursorColor}
            type="left"
            onMove={(newXPosition) => handleCursorMove("left", newXPosition)}
            xScale={xScale}
            svgRef={svgRef}
            viewOnly={viewOnly}
            hidden={selectionStatus === "start"}
          />
          <Cursor
            height={height}
            xPosition={rightCursorPos}
            color={rightCursorColor}
            type="right"
            onMove={(newXPosition) => handleCursorMove("right", newXPosition)}
            xScale={xScale}
            svgRef={svgRef}
            viewOnly={viewOnly}
            hidden={selectionStatus === "start"}
          />
        </>
      )}
    </>
  )
}

export default CustomBrush
