"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "utils"
import { Spinner } from "./ui/spinner"

const CustomTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={cn(className)} {...props} />
))
CustomTabs.displayName = TabsPrimitive.Root.displayName

const CustomTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    loading?: boolean
  }
>(({ className, children, loading, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-baseline justify-center text-primary h-[var(--bar-height)] px-4 space-x-6 relative",
      className,
    )}
    {...props}
  >
    {children}
    <div
      className={cn(
        "absolute right-0 h-full w-10 flex items-center transition-opacity",
        {
          "opacity-0": !loading,
        },
      )}
    >
      <Spinner className="h-6 w-6" />
    </div>
  </TabsPrimitive.List>
))
CustomTabsList.displayName = TabsPrimitive.List.displayName

const CustomTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    count?: number
  }
>(({ className, children, count, ...props }, ref) => (
  <>
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "justify-center whitespace-nowrap rounded-sm text-sm leading-[22px] font-medium ring-offset-primary-dark-green transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none items-center h-full",
        "disabled:data-[state=active]:text-gray-scale-300 disabled:data-[state=active]:decoration-gray-scale-200 disabled:text-gray-scale-300",
        "text-text-tertiary data-[state=active]:text-white",
        "active:!text-gray-scale-200 group space-x-2",
        "data-[state=active]:border-b-[2px] data-[state=active]:border-b-text-brand rounded-b-none border-b-[2px] border-b-transparent",
        "hover:border-b-[2px] hover:border-b-text-brand",
        className,
      )}
      {...props}
    >
      <span className="">{children}</span>
      {count ? (
        <span className="font-ubuntu bg-text-tertiary rounded-full p-1 text-xs text-white no-underline decoration-0">
          {count}
        </span>
      ) : undefined}
    </TabsPrimitive.Trigger>
  </>
))
CustomTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const CustomTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-primary-dark-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-full",
      className,
    )}
    {...props}
  />
))
CustomTabsContent.displayName = TabsPrimitive.Content.displayName

export { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger }
