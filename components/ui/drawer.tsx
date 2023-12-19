"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import * as React from "react"

import { cn } from "utils"
import { Title } from "../typography/title"

const Drawer = DialogPrimitive.Root

const DrawerTrigger = DialogPrimitive.Trigger

const DrawerPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
)
DrawerPortal.displayName = DialogPrimitive.Portal.displayName

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} className={className} {...props} />
))
DrawerClose.displayName = DialogPrimitive.Close.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed w-full bottom-0 p-6 right-0 h-[calc(100vh-var(--bar-height))] z-50 max-w-[362px]",
        "border-2 border-black-rich bg-background  duration-200 transform translate-x-full",
        "data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full data-[state=closed]:fade-out-0  data-[state=open]:fade-in-0  data-[state=closed]:zoom-out-95  data-[state=open]:zoom-in-95  data-[state=closed]:slide-out-to-left-1/2  data-[state=closed]:slide-out-to-top-[48%]  data-[state=open]:slide-in-from-left-1/2  data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = DialogPrimitive.Content.displayName

const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 mb-7 space-y-7", className)} {...props} />
)
DrawerBody.displayName = "DrawerBody"

const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex justify-between items-center border-b pb-4 mb-4",
      className,
    )}
    {...props}
  >
    <Title>{children}</Title>
    <DrawerClose>
      <X className="h-6 w-6 text-gray-scale-300" />
      <span className="sr-only">Close</span>
    </DrawerClose>
  </div>
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-center gap-4", className)} {...props}>
    {children}
  </div>
)
DrawerFooter.displayName = "DialogFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName

export default Drawer

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
}
