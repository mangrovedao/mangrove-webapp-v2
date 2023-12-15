type DialogType = "error" | "success" | "info" | "confirm" | undefined

export type DialogProps = {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  type?: DialogType
}

export type Nodes = {
  children: React.ReactNode
  className?: string
}
