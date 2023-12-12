import { useDialogStore, type ActionButton } from "@/stores/dialog.store"

function open({
  children,
  title = "Confirm",
  actionButtons = [
    {
      id: "cancel",
      value: "toto",
    },
  ],
}: {
  children?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  actionButtons?: ActionButton[]
}) {
  useDialogStore.setState({
    opened: true,
    title,
    children,
    actionButtons,
  })
}

function close() {
  useDialogStore.setState({ opened: false })
}

export const dialogs = {
  open,
  close,
}
