"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-3 w-3 shrink-0 rounded-[2px] border border-green-bangladesh ring-offset-primary-dark-green",
      "hover:border-green-caribbean hover:!text-primary-solid-black",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "disabled:data-[state=checked]:bg-gray-scale-400 disabled:!border-gray-scale-400 disabled:hover:!text-primary disabled:hover:!bg-transparent disabled:data-[state=checked]:hover:!bg-gray-scale-400",
      "data-[state=checked]:hover:!bg-green-caribbean",
      "data-[state=checked]:bg-green-bangladesh data-[state=checked]:text-primary data-[state=checked]:hover:bg-green-caribbean",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
