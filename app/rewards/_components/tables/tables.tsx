import React from "react"

import { CustomTabs } from "@/components/custom-tabs"
import { Points } from "./points/points"

export function Tables({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <div className="pt-4 space-y-4">
      <div className="grid gap-y-4">
        <Points />
      </div>
    </div>
  )
}
