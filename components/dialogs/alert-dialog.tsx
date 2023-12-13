/* eslint-disable @next/next/no-img-element */
import * as Root from "@/components/ui/alert-dialog"
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

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Root.AlertDialogTitle className={titleClasses}>
      {children}
    </Root.AlertDialogTitle>
  )
}

export function Description({ children }: { children: React.ReactNode }) {
  return (
    <Root.AlertDialogDescription className={descriptionClasses}>
      {children}
    </Root.AlertDialogDescription>
  )
}

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <Root.AlertDialogFooter className={footerClasses}>
      {children}
    </Root.AlertDialogFooter>
  )
}
