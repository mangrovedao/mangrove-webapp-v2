import * as Root from "@/components/ui/dialog"
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

export default function Dialog({
  open,
  onClose,
  type = "confirm",
  children,
}: Props) {
  return (
    <Root.Dialog open={open} onOpenChange={onClose}>
      <div className="w-full h-full relative">
        <Root.DialogContent className={getContentClasses(type)}>
          <Root.DialogHeader>
            <Heading type={type} />
            {children}
          </Root.DialogHeader>
        </Root.DialogContent>
      </div>
    </Root.Dialog>
  )
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Root.DialogTitle className={titleClasses}>{children}</Root.DialogTitle>
  )
}

export function Description({ children }: { children: React.ReactNode }) {
  return (
    <Root.DialogDescription className={descriptionClasses}>
      {children}
    </Root.DialogDescription>
  )
}

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <Root.DialogFooter className={footerClasses}>{children}</Root.DialogFooter>
  )
}
