import type { DialogType } from "@/components/dialogs/types"
import { useDialogStore, type ActionButton } from "@/stores/dialog.store"

function open({
  children,
  title = "Confirm",
  actionButtons = [
    {
      id: "cancel",
    },
  ],
  type,
}: {
  children?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  actionButtons?: ActionButton[]
  type?: DialogType
}) {
  useDialogStore.setState({
    opened: true,
    title,
    children,
    actionButtons,
    type,
  })
}

function close() {
  useDialogStore.setState({ opened: false })
}

export const dialogs = {
  open,
  close,
}
