"use client"

import { cn } from "@/utils"
import withMouseHoverEffect from "./HOC/with-mouse-hover-effect"

export default withMouseHoverEffect(function ({
  isActive = false,
  children,
  text,
}: {
  isActive?: boolean
  children: React.ReactNode
  text: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-md transition ease-out duration-300 relative",
        isActive
          ? "bg-nav-item-button-icon-fg-hover text-white hover:text-white"
          : "",
      )}
    >
      <span className={cn("flex justify-center items-center")}>{children}</span>
      <div className="text-base">{text}</div>
    </div>
  )
})
