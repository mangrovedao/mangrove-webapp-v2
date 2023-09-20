import { useDialogStore } from "@/stores/dialog.store"

export function openConfirmDialog({
  onConfirm,
  children,
  title = "Confirm",
  description = "Are you sure you want to do this?",
}: {
  onConfirm: () => void
  children?: React.ReactNode
  title?: string | React.ReactNode
  description?: string | React.ReactNode
}) {
  useDialogStore.setState({
    opened: true,
    title,
    description,
    children,
    actionButtons: [
      {
        isClosing: true,
        id: "cancel",
      },
      {
        onClick: onConfirm,
        children: "Confirm",
        id: "confirm",
      },
    ],
  })
}
