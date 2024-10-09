import { ChevronRight } from "@/svgs"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "utils"
import { Spinner } from "./spinner"

const buttonVariants = cva(
  [
    "rounded-xl transition-all border border-solid border-transparent",
    "outline-offset-2 ring-red-200 outline-transparent disabled:bg-bg-disabled-subtle disabled:text-text-disabled",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-button-primary-bg hover:bg-button-primary-bg-hover text-button-primary-fg disabled:bg-bg-disabled disabled:text-button-primary-fg_disabled",
        secondary:
          "bg-button-secondary-bg hover:bg-button-secondary-bg-hover border-border-primary text-button-secondary-fg",
        tertiary: ["", ""],
        link: "text-primary underline-offset-4 hover:underline",
        invisible: "text-white hover:opacity-80 transition-opacity",
      },
      size: {
        xxs: "text-sm px-0.5",
        xs: "text-sm px-1",
        sm: "text-sm px-3 py-[6px]",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg px-[18px] py-3",
        only: "",
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
        size: ["lg", "md"],
        className: "px-[14px] py-[10px]",
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
