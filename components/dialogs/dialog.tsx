import * as Root from "@/components/ui/dialog"
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

type Nodes = {
  children: React.ReactNode
  className?: string
}

export function Title({ children, className }: Nodes) {
  return (
    <Root.DialogTitle className={cn(titleClasses, className)}>
      {children}
    </Root.DialogTitle>
  )
}

export function Description({ children, className }: Nodes) {
  return (
    <Root.DialogDescription className={cn(descriptionClasses, className)}>
      {children}
    </Root.DialogDescription>
  )
}

export function Footer({ children, className }: Nodes) {
  return (
    <Root.DialogFooter className={cn(footerClasses, className)}>
      {children}
    </Root.DialogFooter>
  )
}
