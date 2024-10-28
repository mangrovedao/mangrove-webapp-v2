import * as Root from "@/components/ui/dialog-new"
import { cn } from "@/utils"
import { Heading } from "./heading"
import {
  descriptionClasses,
  footerClasses,
  getContentClasses,
  titleClasses,
} from "./styles-new"
import type { DialogProps, Nodes } from "./types"

export default function Dialog({
  open,
  onClose,
  type,
  children,
  className,
  showCloseButton = true,
}: DialogProps) {
  return (
    <Root.Dialog open={open} onOpenChange={onClose}>
      <div className="w-full h-full relative">
        <Root.DialogContent
          className={cn(getContentClasses(type), className)}
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

function Footer({ children, className }: Nodes) {
  return (
    <Root.DialogFooter className={cn(footerClasses, className)}>
      {children}
    </Root.DialogFooter>
  )
}
Dialog.Footer = Footer
Dialog.Close = Root.DialogClose
