import * as Root from "@/components/ui/dialog"
import { cn } from "@/utils"
import { Heading } from "./heading"
import {
  descriptionClasses,
  footerClasses,
  getContentClasses,
  titleClasses,
} from "./styles"
import type { DialogProps, Nodes } from "./types"

export default function Dialog({
  open,
  onClose,
  type,
  children,
  showCloseButton = true,
}: DialogProps) {
  return (
    <Root.Dialog open={open} onOpenChange={onClose}>
      <div className="w-full h-full relative">
        <Root.DialogContent
          className={getContentClasses(type)}
          showCloseButton={showCloseButton}
        >
          <Root.DialogHeader>
            <Heading type={type} />
            {children}
          </Root.DialogHeader>
        </Root.DialogContent>
      </div>
    </Root.Dialog>
  )
}

function Title({
  children,
  className,
  close = false,
}: Nodes & { close?: boolean }) {
  return (
    <Root.DialogTitle
      className={cn(titleClasses, className, {
        "flex justify-between items-center": close,
      })}
    >
      {children}
      {close && <Root.XClose />}
    </Root.DialogTitle>
  )
}
Dialog.Title = Title

function Description({ children, className }: Nodes) {
  return <div className={cn(descriptionClasses, className)}>{children}</div>
}
Dialog.Description = Description

function Footer({
  children,
  className,
  center = false,
}: Nodes & { center?: boolean }) {
  return (
    <Root.DialogFooter
      className={cn(footerClasses, className, {
        "flex flex-col gap-4 justify-center sm:space-x-0 sm:flex-col": center,
      })}
    >
      {children}
    </Root.DialogFooter>
  )
}
Dialog.Footer = Footer
Dialog.Close = Root.DialogClose
