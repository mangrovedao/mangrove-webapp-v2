import { useAlertDialogStore } from "@/stores/alert-dialog.store"
import { type ActionButton } from "@/stores/dialog.store"

function open({
  title = "Alert Dialog",
  children = undefined,
  actionButtons = [
    {
      isClosing: true,
    },
  ],
}: {
  children?: React.ReactNode
  title?: string | React.ReactNode
  actionButtons?: ActionButton[]
}) {
  useAlertDialogStore.setState({
    opened: true,
    title,
    children,
    actionButtons,
  })
}

function close() {
  useAlertDialogStore.setState({ opened: false })
}

export const alertDialogs = {
  open,
  close,
}
