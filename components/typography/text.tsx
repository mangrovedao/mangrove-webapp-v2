import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/utils"

const textStyles = cva("font-ubuntu", {
  variants: {
    variant: {
      text1: "text-sm lg:text-base leading-[22px]",
      text2: "text-xs lg:text-sm leading-[22px]",
      text3: "text-lg",
    },
  },
  defaultVariants: {
    variant: "text1",
  },
})

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof textStyles> & {
    as?: React.ElementType
  }

export function Text({
  variant,
  className,
  as: Comp = "div",
  ...props
}: TitleProps) {
  return <Comp className={cn(textStyles({ variant }), className)} {...props} />
}
