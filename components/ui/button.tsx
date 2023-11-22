import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "utils"

const buttonVariants = cva(
  "rounded-2xl text-black-rich box-border transition-colors active:text-gray-scale-200 disabled:text-gray-scale-400",
  {
    variants: {
      variant: {
        default:
          "bg-green-caribbean hover:bg-green-bangladesh hover:text-white disabled:bg-gray-scale-600",
        outline:
          "border border-green-caribbean hover:border-green-bangladesh text-white disabled:border-gray-scale-500",
        link: "text-primary underline-offset-4 hover:underline",
        invisible: "text-white",
      },
      size: {
        sm: "px-3 pb-1 pt-[6px] leading-[14px]",
        md: "px-3 py-2 text-sm leading-[14px]",
        lg: "p-3 leading-5 rounded-[32px]",
      },
    },
    compoundVariants: [
      {
        size: ["sm", "md"],
        variant: "outline",
        className: "leading-3",
      },
    ],
    defaultVariants: {
      variant: "default",
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
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
