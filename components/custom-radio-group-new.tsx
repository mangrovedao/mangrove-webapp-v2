"use client"

import type { RadioGroupItemProps } from "@radix-ui/react-radio-group"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "utils"

const CustomRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex w-full rounded-xl bg-muted ", className)}
      {...props}
      ref={ref}
    />
  )
})
CustomRadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const customRadioGroupItemVariants = cva(
  `w-full rounded-xl border border-transparent aria-checked:text-primary
  hover:cursor-pointer hover:text-secondary transition-colors text-text-secondary
  ring-offset-primary-dark-green focus:outline-none focus-visible:ring-2 py-2 px-3
  focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium `,
  {
    variants: {
      variant: {
        primary: "aria-checked:bg-bg-active focus-visible:ring-ring",
        secondary: "aria-checked:border-red-100",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
)

const CustomRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps & VariantProps<typeof customRadioGroupItemVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(customRadioGroupItemVariants({ variant }), className)}
      {...props}
    />
  )
})
CustomRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { CustomRadioGroup, CustomRadioGroupItem }
