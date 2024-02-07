/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScaleLinear } from "d3-scale"
import React from "react"

import { cn } from "@/utils"

interface CursorProps {
  xPosition: number
  height: number
  color?: "red" | "neutral" | "green"
  type: "left" | "right"
  onMove: (newXPosition: number) => void
  xScale: ScaleLinear<number, number>
  svgRef: React.RefObject<SVGSVGElement>
  viewOnly?: boolean
  hidden?: boolean
}

export default function Cursor({
  xPosition,
  height,
  color,
  type,
  onMove,
  xScale,
  svgRef,
  viewOnly = false,
  hidden = false,
}: CursorProps) {
  const [isDragging, setIsDragging] = React.useState(false)

  const handleMouseDown = React.useCallback((event: MouseEvent) => {
    if (viewOnly) return
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleMouseUp = React.useCallback((event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleMouseMove = React.useCallback(
    (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      if (isDragging) {
        const svg = svgRef.current
        if (!svg) return
        const rect = svg.getBoundingClientRect()
        const x = event.clientX - rect.left
        const newPrice = xScale.invert(x)
        onMove(newPrice)
      }
    },
    [isDragging, onMove, xScale, svgRef],
  )

  React.useEffect(() => {
    if (viewOnly) return
    const svg = svgRef.current
    svg?.addEventListener("mousemove", handleMouseMove)
    svg?.addEventListener("mouseup", handleMouseUp)

    return () => {
      svg?.removeEventListener("mousemove", handleMouseMove)
      svg?.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    svgRef,
    viewOnly,
  ])

  return (
    <>
      <g
        width="25"
        height="24"
        fill="none"
        transform={`translate(${xPosition}, 0)`}
        className={cn(
          "transition-opacity",
          hidden ? "opacity-0" : "opacity-100",
          {
            "cursor-col-resize": !viewOnly,
            "text-green-caribbean": color === "green" || color === "neutral",
            "text-cherry-100": color === "red",
          },
        )}
        // @ts-ignore
        onMouseDown={handleMouseDown}
      >
        <line x1="0" y1="0" x2="0" y2={height} stroke="currentColor" />
        <g
          className={cn("-translate-x-3 translate-y-[calc(50%-24px)]", {
            hidden: viewOnly,
          })}
        >
          {type === "left" ? (
            <>
              <rect
                width="24"
                height="24"
                x="24.745"
                fill="currentColor"
                rx="8"
                transform={"rotate(90 24.745 0)"}
              />
              <path
                stroke="#010D0D"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M14.745 7l-5 5 5 5"
              />
            </>
          ) : (
            <>
              <rect
                width="24"
                height="24"
                x="0.745"
                y="24"
                fill="currentColor"
                rx="8"
                transform="rotate(-90 .745 24)"
              />
              <path
                stroke="#010D0D"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.745 17l5-5-5-5"
              ></path>
            </>
          )}
        </g>
      </g>
    </>
  )
}
