import { web3modal } from "@/providers/wallet-connect"
import { alertDialogs } from "@/services/alert-dialogs.service"

// Open the network selection modal from wallet connect
function changeNetwork() {
  web3modal.open({
    view: "Networks",
  })
}

// open the alert dialog saying that the network is wrong
function openWrongNetworkAlertDialog({
  title = "Wrong network",
  children = "Mangrove does not support this network yet.",
}: {
  children?: React.ReactNode
  title?: React.ReactNode
} = {}) {
  alertDialogs.open({
    title,
    children,
    actionButtons: [
      {
        onClick: changeNetwork,
        children: "Change network",
        id: "change-network",
        className: "w-full",
      },
    ],
    type: "error",
  })
}

export const networkService = {
  changeNetwork,
  openWrongNetworkAlertDialog,
  closeWrongNetworkAlertDialog: alertDialogs.close,
}
