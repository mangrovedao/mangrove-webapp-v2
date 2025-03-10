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
  return (
    <div
      className={cn("flex gap-4 absolute left-2", {
        "top-[9px]": position === "top",
        "bottom-[9px]": position === "bottom",
      })}
    >
      {Array.from({ length: 15 }, (_, index) => (
        <span
          key={`slider-top-decoration-${index}`}
          className={cn("h-[2px] w-[2px] rounded-full bg-bg-secondary", {
            "bg-bg-tertiary": (Number(value) / 100) * 15 > index,
            "bg-muted": (Number(value) / 100) * 15 <= index,
          })}
        />
      ))}
    </div>
  )
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <>
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center disabled:text-muted",
        className,
      )}
      {...props}
    >
      <Ticks value={props.value} position="bottom" />
      <SliderPrimitive.Track className="relative h-[5px] w-full grow rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute rounded-full h-full bg-bg-tertiary" />
        <div className="flex justify-between">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={`slider-point-${index}`}
              className={cn("h-[4px] w-[4px] rounded-full")}
            />
          ))}
        </div>
      </SliderPrimitive.Track>
      <Ticks value={props.value} position="top" />
      <SliderPrimitive.Thumb className="z-50 focus-visible:outline-none active:!text-gray-scale-200 text-xs font-sans border-[0.5px] border-bg-tertiary hover:bg-bg-tertiary cursor-pointer whitespace-nowrap rounded-sm bg-bg-secondary transition-colors disabled:pointer-events-none disabled:opacity-50">
        <span className="px-2 text-xs">{props.value}% </span>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  </>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
