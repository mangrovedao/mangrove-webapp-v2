import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "utils"

const buttonVariants = cva(
  [
    "rounded-2xl text-black-rich box-border transition-colors active:text-gray-scale-200 disabled:text-gray-scale-400",
    "focus-visible:ring-4 focus-visible:ring-primary-dark-green focus-visible:outline-0 focus-visible:ring-offset-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-green-caribbean hover:bg-green-bangladesh hover:text-white",
        secondary:
          "border border-green-caribbean hover:border-green-bangladesh text-white disabled:border-gray-scale-500",
        tertiary: [
          "bg-primary-dark-green border border-primary-dark-green text-green-caribbean",
          "focus:bg-primary-solid-black hover:bg-green-bangladesh active:text-primary-solid-black",
        ],
        link: "text-primary underline-offset-4 hover:underline",
        invisible: "text-white",
      },
      size: {
        sm: "px-3 pb-1 pt-[6px] leading-[14px]",
        md: "px-3 py-2 text-sm leading-[14px]",
        lg: "p-3 leading-5 rounded-[32px]",
        icon: "flex justify-center items-center aspect-square p-0 h-6",
      },
    },
    compoundVariants: [
      {
        size: ["sm", "md"],
        variant: "secondary",
        className: "leading-3",
      },
      {
        variant: ["primary", "tertiary"],
        className: "disabled:bg-gray-scale-600 disabled:border-transparent",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-disabled={props.disabled}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
