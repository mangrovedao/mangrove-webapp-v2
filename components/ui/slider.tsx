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
      className={cn("flex gap-4 absolute left-1", {
        "top-[9px]": position === "top",
        "bottom-[9px]": position === "bottom",
      })}
    >
      {Array.from({ length: 17 }, (_, index) => (
        <span
          key={`slider-top-decoration-${index}`}
          className={cn("h-[2px] w-[2px] rounded-full bg-green-bangladesh", {
            "bg-green-caribbean": (Number(value) / 100) * 18 > index,
            "bg-muted": (Number(value) / 100) * 18 <= index,
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
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <Ticks value={props.defaultValue} position="bottom" />
      <SliderPrimitive.Track className="relative h-[5px] w-full grow rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute rounded-full h-full bg-green-bangladesh" />
        <div className="flex justify-between">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={`slider-point-${index}`}
              className={cn("h-[4px] w-[4px] rounded-full")}
            />
          ))}
        </div>
      </SliderPrimitive.Track>
      <Ticks value={props.defaultValue} position="top" />
      <SliderPrimitive.Thumb className="focus-visible:outline-none active:!text-gray-scale-200 cursor-pointer whitespace-nowrap rounded-xl border-[1px] border-green-bangladesh bg-background transition-colors disabled:pointer-events-none disabled:opacity-50 ">
        <span className="text-xs px-2">{props.defaultValue}% </span>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  </>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
