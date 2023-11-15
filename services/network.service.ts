import { web3modal } from "@/providers/wallet-connect"
import { alertDialogs } from "@/services/alert-dialogs.service"

// Close the alert dialog saying that the network is wrong
// and open the network selection modal from wallet connect
function changeNetwork() {
  // alertDialogs.close()
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
      },
    ],
  })
}

export const networkService = {
  changeNetwork,
  openWrongNetworkAlertDialog,
  closeWrongNetworkAlertDialog: alertDialogs.close,
}
