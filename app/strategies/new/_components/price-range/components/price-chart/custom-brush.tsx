"use client"

import { cn } from "@/utils"
import { type ScaleLinear } from "d3-scale"
import React, { useEffect, useRef, useState } from "react"
import Cursor from "./cursor"

type SelectionStatus = "idle" | "start" | "end"

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
  const [selection, setSelection] = useState<[number, number] | null>(
    value ?? null,
  )
  const [selectionStatus, setSelectionStatus] = useState("idle")
  const rectRef = useRef<SVGRectElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragMode, setDragMode] = useState(false)

  // Update selection when value prop changes
  useEffect(() => {
    setSelection(value ?? null)
  }, [value])

  const handleMouseDown = React.useCallback(
    (event: MouseEvent) => {
      const rect = rectRef.current
      if (rect) {
        const svgRect = rect.getBoundingClientRect()
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
    [selection, width, xScale],
  )

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      const rect = rectRef.current
      if (rect) {
        const svgRect = rect.getBoundingClientRect()
        const xPixel = event.clientX - svgRect.left
        const x = xScale.invert(xPixel)
        if (
          dragging &&
          dragMode &&
          selection &&
          startValueRef.current !== null
        ) {
          const dx = x - startValueRef.current
          setSelection([dx, dx + (selection[1] - selection[0])]) // apply the offset
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
    [xScale, dragging, dragMode, selection, selectionStatus],
  )

  const handleMouseUp = React.useCallback(() => {
    setDragging(false)
    setSelectionStatus("end")
    if (selection !== null && onBrushEnd) {
      onBrushEnd(selection.sort((a, b) => a - b) as [number, number])
    }
  }, [onBrushEnd, selection])

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

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
      <rect ref={rectRef} width={width} height={height} fill="transparent" />

      {selection && (
        <rect
          x={brushX}
          y={0}
          width={brushWidth}
          height={height}
          fill="rgba(255, 0, 0, 0.1)"
          className={cn({
            "cursor-grab": !dragging,
            "cursor-grabbing": dragging,
          })}
        />
      )}
      {selection && (
        <>
          <Cursor
            height={height}
            xPosition={leftCursorPos}
            color="green"
            type="left"
          />
          <Cursor
            height={height}
            xPosition={rightCursorPos}
            color="red"
            type="right"
          />
        </>
      )}
    </>
  )
}

export default CustomBrush
