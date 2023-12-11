"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"

import { cn } from "utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        `pb-0.5 pt-1 px-2 text-secondary rounded-2xl border text-sm leading-[22px] font-normal
            hover:cursor-pointer border-primary-dark-green
            ring-offset-primary-dark-green focus:outline-none focus-visible:ring-2 transition-colors
            focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-gray-scale-600 disabled:text-gray-scale-400
            hover:text-green-caribbean active:text-green-bangladesh
            aria-checked:border-green-bangladesh aria-checked:hover:border-green-caribbean aria-checked:text-white aria-checked:active:text-gray`,
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
