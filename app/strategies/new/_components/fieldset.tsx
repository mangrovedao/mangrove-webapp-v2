import { Title } from "@/components/typography/title"
import { cn } from "@/utils"
import React from "react"

type Props = React.ComponentProps<"fieldset"> & {
  legend: React.ReactNode
}

export function Fieldset({ className, legend, children, ...props }: Props) {
  return (
    <fieldset className={cn("space-y-4", className)} {...props}>
      <Title variant={"title2"} as="legend">
        {legend}
      </Title>
      {children}
    </fieldset>
  )
}
