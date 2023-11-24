"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"

import { cn } from "utils"

const CustomRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        " flex w-full gap-1 p-[0.19rem] h-10 rounded-3xl bg-muted",
        className,
      )}
      {...props}
      ref={ref}
    />
  )
})
CustomRadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const CustomRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        ` w-full text-secondary rounded-3xl aria-checked:border aria-checked:border-green-caribbean aria-checked:text-primary
            hover:bg-green-caribbean hover:cursor-pointer hover:text-primary
            ring-offset-background focus:outline-none focus-visible:ring-2  
            focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
CustomRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { CustomRadioGroup, CustomRadioGroupItem }
