import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/utils"

const titleStyles = cva("text-current", {
  variants: {
    variant: {
      header1: "text-3xl",
      title1: "text-lg lg:text-lg leading-8",
      title2: "text-sm lg:text-base leading-5",
      title3: "text-xs lg:text-sm leading-[14px]",
    },
    weight: {
      bold: "font-bold",
      medium: "font-medium",
    },
  },
  defaultVariants: {
    variant: "title1",
    weight: "medium",
  },
})

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof titleStyles> & {
    as?: React.ElementType
  }

export function Title({
  variant,
  className,
  as: Comp = "h1",
  ...props
}: TitleProps) {
  return <Comp className={cn(titleStyles({ variant }), className)} {...props} />
}
