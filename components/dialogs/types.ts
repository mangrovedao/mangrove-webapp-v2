export type DialogType =
  | "error"
  | "success"
  | "info"
  | "confirm"
  | "oxium"
  | undefined

export type DialogProps = {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  type?: DialogType
  showCloseButton?: boolean
  className?: string
}

export type Nodes = {
  children: React.ReactNode
  className?: string
}
