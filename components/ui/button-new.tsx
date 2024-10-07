import { ChevronRight } from "@/svgs"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "utils"
import { Spinner } from "./spinner"

const buttonVariants = cva(
  [
    "rounded-2xl text-black-rich box-border transition-colors disabled:text-gray-scale-400 group/button font-medium",
    "focus-visible:ring-4 focus-visible:ring-primary-dark-green focus-visible:outline-0 focus-visible:ring-offset-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-green-caribbean hover:bg-green-bangladesh hover:text-white",
        secondary:
          "bg-bg-secondary hover:border-green-bangladesh text-white disabled:border-gray-scale-500",
        tertiary: [
          "bg-primary-dark-green border border-primary-dark-green text-green-caribbean",
          "focus:bg-primary-solid-black hover:bg-green-bangladesh active:text-primary-solid-black active:bg-green-bangladesh",
        ],
        link: "text-primary underline-offset-4 hover:underline",
        invisible: "text-white hover:opacity-80 transition-opacity",
      },
      size: {
        sm: "px-3 pb-1 pt-[6px] leading-[14px]",
        md: "px-3 py-2 text-sm leading-[14px]",
        lg: "px-5 py-3 leading-5 rounded-[32px]",
        icon: "flex justify-center items-center aspect-square p-0 h-6",
      },
      rightIcon: {
        true: "flex items-center justify-center space-x-1",
      },
      asChild: {
        true: "inline-block",
      },
    },
    compoundVariants: [
      {
        size: ["sm", "md"],
        variant: "secondary",
        className: "leading-3",
      },
      {
        variant: ["primary", "secondary"],
        className: "active:text-gray-scale-100",
      },
      {
        variant: ["primary", "tertiary"],
        className: "disabled:bg-gray-scale-200 disabled:border-transparent",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

const rightIconVariants = cva(
  [
    "text-primary-solid-black aspect-square w-6 flex items-center justify-center bg-white rounded-full ml-2",
    "group-active/button:text-primary-solid-black group-hover/button:text-primary-solid-black",
    "group-disabled/button:text-gray-scale-600 group-disabled/button:bg-gray-scale-300",
  ],
  {
    variants: {
      variant: {
        primary: "",
        secondary: [
          "bg-primary-dark-green text-white group-active/button:text-white group-hover/button:text-white",
          "group-disabled/button:bg-gray-scale-600 group-disabled/button:text-gray-scale-400",
        ],
        tertiary: "",
        link: "",
        invisible: "",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  rightIcon?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, rightIcon, loading, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    const body = !asChild ? (
      <>
        {loading ? <Spinner className="w-6 mx-auto" /> : props.children}
        {rightIcon && !loading && (
          <span className={cn(rightIconVariants({ variant }))}>
            <ChevronRight className="aspect-auto w-4" />
          </span>
        )}
      </>
    ) : (
      props.children
    )
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className, rightIcon, asChild }),
        )}
        ref={ref}
        aria-disabled={props.disabled}
        {...props}
      >
        {body}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
