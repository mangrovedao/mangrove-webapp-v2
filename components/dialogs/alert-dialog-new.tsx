/* eslint-disable @next/next/no-img-element */
import * as Root from "@/components/ui/alert-dialog-new"
import { cn } from "@/utils"
import { Heading } from "./heading"
import {
  descriptionClasses,
  footerClasses,
  getContentClasses,
  titleClasses,
} from "./styles"
import type { DialogProps, Nodes } from "./types"

export default function AlertDialog({
  open,
  onClose,
  type = "confirm",
  children,
}: DialogProps) {
  return (
    <Root.AlertDialog open={open} onOpenChange={onClose}>
      <div className="w-full h-full relative">
        <Root.AlertDialogContent className={getContentClasses(type)}>
          <Root.AlertDialogHeader>
            <Heading type={type} />
            {children}
          </Root.AlertDialogHeader>
        </Root.AlertDialogContent>
      </div>
    </Root.AlertDialog>
  )
}

function Title({ children, className }: Nodes) {
  return (
    <Root.AlertDialogTitle className={cn(titleClasses, className)}>
      {children}
    </Root.AlertDialogTitle>
  )
}
AlertDialog.Title = Title

function Description({ children, className }: Nodes) {
  return <div className={cn(descriptionClasses, className)}>{children}</div>
}

AlertDialog.Description = Description

function Footer({ children, className }: Nodes) {
  return (
    <Root.AlertDialogFooter className={cn(footerClasses, className)}>
      {children}
    </Root.AlertDialogFooter>
  )
}
AlertDialog.Footer = Footer
