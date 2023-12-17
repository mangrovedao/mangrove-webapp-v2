import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/utils"

const captionStyles = cva("font-normal", {
  variants: {
    variant: {
      caption1: "lg:text-xs leading-[22px]",
      caption2: "lg:text-[10px] leading-[22px]",
    },
  },
  defaultVariants: {
    variant: "caption1",
  },
})

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof captionStyles> & {
    as?: React.ElementType
  }

export function Caption({
  variant,
  className,
  as: Comp = "div",
  ...props
}: TitleProps) {
  return (
    <Comp className={cn(captionStyles({ variant }), className)} {...props} />
  )
}
