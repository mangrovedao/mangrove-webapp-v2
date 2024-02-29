export type DialogType =
  | "error"
  | "success"
  | "info"
  | "confirm"
  | "mangrove"
  | undefined

export type DialogProps = {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  type?: DialogType
  showCloseButton?: boolean
}

export type Nodes = {
  children: React.ReactNode
  className?: string
}
