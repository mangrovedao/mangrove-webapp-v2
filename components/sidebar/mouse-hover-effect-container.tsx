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
        "flex items-center gap-2 px-2 py-4 rounded-xl max-w-14 @[120px]:max-w-none transition ease-out duration-300 relative",
        isActive
          ? "bg-nav-item-button-icon-fg-hover text-white hover:text-white"
          : "",
      )}
    >
      <span className={cn("w-[39px] flex justify-center items-center")}>
        {children}
      </span>
      <div className="hidden @[120px]:block opacity-0 @[120px]:!opacity-100 transition ease-out duration-300 text-base z-50">
        {text}
      </div>
    </div>
  )
})
