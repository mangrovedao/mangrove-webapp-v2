import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/utils"

const titleStyles = cva("text-current font-medium", {
  variants: {
    variant: {
      header1: "text-xl lg:text-2xl",
      title1: "text-lg lg:text-xl leading-8",
      title2: "text-sm lg:text-base leading-5",
      title3: "text-xs lg:text-sm leading-[14px]",
    },
  },
  defaultVariants: {
    variant: "title1",
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
