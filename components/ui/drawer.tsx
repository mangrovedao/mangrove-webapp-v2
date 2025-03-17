"use client"

import { cn } from "@/utils"
import * as React from "react"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const Drawer = ({ open, onOpenChange, children, className }: DrawerProps) => {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setIsVisible(true)
      // Small delay to ensure DOM is ready before animation starts
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      document.body.style.overflow = "hidden"
      return () => clearTimeout(timer)
    } else if (isVisible) {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match this with the CSS transition duration
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [open, isVisible])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])

  if (!isVisible) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[10px] border border-border-tertiary bg-background shadow-lg",
          "transition-all duration-300 ease-out",
          isAnimating
            ? "translate-y-0 scale-100"
            : "translate-y-full scale-[0.98]",
          className,
        )}
      >
        <div className="mx-auto mt-4 h-1.5 w-[60px] rounded-full bg-muted/60" />
        <div className="overflow-auto">{children}</div>
      </div>
    </>
  )
}

Drawer.Content = function DrawerContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("p-4 animate-fadeIn", className)}>{children}</div>
}

Drawer.Header = function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-1.5 p-4 text-center sm:text-left border-b border-border-tertiary",
        className,
      )}
      {...props}
    />
  )
}

Drawer.Footer = function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2 p-4 border-t border-border-tertiary",
        className,
      )}
      {...props}
    />
  )
}

export { Drawer }
