"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "utils"

const CustomTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={cn(className)} {...props} />
))
CustomTabs.displayName = TabsPrimitive.Root.displayName

const CustomTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-baseline justify-center text-primary h-[var(--bar-height)]",
      className,
    )}
    {...props}
  />
))
CustomTabsList.displayName = TabsPrimitive.List.displayName

const CustomTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <>
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "justify-center whitespace-nowrap rounded-sm px-3 text-sm leading-[22px] font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:underline  data-[state=active]:underline-offset-[1.35rem]  data-[state=active]:decoration-green-caribbean  data-[state=active]:decoration-2  data-[state=active]:shadow-sm items-center h-full",
        className,
      )}
      {...props}
    />
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
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
CustomTabsContent.displayName = TabsPrimitive.Content.displayName

export { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger }
