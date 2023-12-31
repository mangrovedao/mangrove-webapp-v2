import { useAlertDialogStore } from "@/stores/alert-dialog.store"
import { type ActionButton } from "@/stores/dialog.store"

function open({
  title = "Alert Dialog",
  children = undefined,
  actionButtons = [
    {
      isClosing: true,
      id: "cancel",
    },
  ],
  type = "info",
}: {
  children?: React.ReactNode
  title?: React.ReactNode
  actionButtons?: ActionButton[]
  type?: "info" | "confirm" | "error" | "success"
}) {
  useAlertDialogStore.setState({
    opened: true,
    title,
    children,
    actionButtons,
    type,
  })
}

function close() {
  useAlertDialogStore.setState({ opened: false })
}

export const alertDialogs = {
  open,
  close,
}
