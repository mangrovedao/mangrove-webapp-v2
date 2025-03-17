"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cn } from "utils"

const Ticks = ({
  position = "top",
  value,
}: {
  position: string
  value: number[] | undefined
}) => {
  // Calculate the actual value percentage (0-100)
  const valuePercentage = Number(value) || 0

  // Calculate how many ticks should be active based on the current value
  // We use Math.round to ensure we get a precise number of ticks
  const activeTicks = Math.round((valuePercentage / 100) * 15)

  return (
    <div
      className={cn("flex gap-4 absolute left-2 right-2 justify-between", {
        "top-[9px]": position === "top",
        "bottom-[9px]": position === "bottom",
      })}
    >
      {Array.from({ length: 15 }, (_, index) => (
        <span
          key={`slider-${position}-decoration-${index}`}
          className={cn("h-[2px] w-[2px] rounded-full", {
            "bg-bg-tertiary": index < activeTicks,
            "bg-muted": index >= activeTicks,
          })}
        />
      ))}
    </div>
  )
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  // State to track if the tooltip should be visible
  const [showTooltip, setShowTooltip] = React.useState(false)

  // Get the current value
  const value = Array.isArray(props.value) ? props.value[0] : props.value

  return (
    <div
      className="relative pt-2" // Increased top padding to make room for tooltip
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex touch-none select-none items-center disabled:text-muted",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-[5px] w-full grow rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute rounded-full h-full bg-bg-tertiary" />
          <Ticks value={props.value} position="bottom" />
          <Ticks value={props.value} position="top" />
        </SliderPrimitive.Track>

        {/* Custom thumb with tooltip */}
        <SliderPrimitive.Thumb className="relative block h-4 w-4 cursor-pointer rounded-sm border border-bg-tertiary bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          {showTooltip && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="text-[10px] font-extralight bg-bg-secondary px-1 py-0.5 rounded-sm whitespace-nowrap">
                {value}%
              </div>
            </div>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
