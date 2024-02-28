import { cn } from "@/utils"
import React from "react"

type Props = {
  className?: string
} & React.PropsWithChildren

export default function BoxContainer({ children, className }: Props) {
  return (
    <div className={cn("p-6 bg-primary-bush-green rounded-lg", className)}>
      {children}
    </div>
  )
}
