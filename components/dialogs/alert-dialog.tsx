/* eslint-disable @next/next/no-img-element */
import * as Root from "@/components/ui/alert-dialog"
import { cn } from "@/utils"
import { Heading } from "./heading"
import {
  descriptionClasses,
  footerClasses,
  getContentClasses,
  titleClasses,
} from "./styles"
import type { DialogType } from "./types"

type Props = {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  type?: DialogType
}

export default function AlertDialog({
  open,
  onClose,
  type = "confirm",
  children,
}: Props) {
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

type Nodes = {
  children: React.ReactNode
  className?: string
}

export function Title({ children, className }: Nodes) {
  return (
    <Root.AlertDialogTitle className={cn(titleClasses, className)}>
      {children}
    </Root.AlertDialogTitle>
  )
}

export function Description({ children, className }: Nodes) {
  return (
    <Root.AlertDialogDescription className={cn(descriptionClasses, className)}>
      {children}
    </Root.AlertDialogDescription>
  )
}

export function Footer({ children, className }: Nodes) {
  return (
    <Root.AlertDialogFooter className={cn(footerClasses, className)}>
      {children}
    </Root.AlertDialogFooter>
  )
}
