"use client"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import * as React from "react"

import { cn } from "utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(false)
  const [showTopArrow, setShowTopArrow] = React.useState(false)
  const [showBottomArrow, setShowBottomArrow] = React.useState(false)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const checkScroll = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    // Check horizontal scroll
    setShowLeftArrow(viewport.scrollLeft > 0)
    setShowRightArrow(
      viewport.scrollWidth > viewport.clientWidth &&
        viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth,
    )

    // Check vertical scroll
    setShowTopArrow(viewport.scrollTop > 0)
    setShowBottomArrow(
      viewport.scrollHeight > viewport.clientHeight &&
        viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight,
    )
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    checkScroll()
    viewport.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)

    return () => {
      viewport.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {showLeftArrow && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none flex items-center justify-start pl-2">
          <ChevronLeft className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
      )}
      {showRightArrow && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none flex items-center justify-end pr-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
      )}
      {showTopArrow && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none flex items-start justify-center pt-2">
          <ChevronUp className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
      )}
      {showBottomArrow && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none flex items-end justify-center pb-2">
          <ChevronDown className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
      )}
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
        onScroll={checkScroll}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-1.5 border-l border-l-transparent p-px",
      orientation === "horizontal" &&
        "h-1.5 flex-col border-t border-t-transparent p-px",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
