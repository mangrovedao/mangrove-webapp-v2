import BlockExplorer from "@/app/strategies/[address]/_components/block-explorer"
import { dialogs } from "@/services/dialogs.service"

// open the alert dialog saying that the network is wrong
function openTxCompletedDialog({
  title = "Order Submitted",
  address,
  blockExplorerUrl,
}: {
  title?: React.ReactNode
  address: string
  blockExplorerUrl?: string
}) {
  dialogs.open({
    title,
    children: (
      <div className="space-y-4">
        <div className="w-full bg-primary-dark-green rounded-lg py-3 px-4 flex items-center justify-between">
          {blockExplorerUrl && (
            <BlockExplorer
              description
              copy
              address={address}
              blockExplorerUrl={blockExplorerUrl}
            />
          )}
        </div>
      </div>
    ),
    actionButtons: [
      {
        onClick: dialogs.close,
        children: "Close",
        id: "close-tx-completed-dialog",
        className: "w-full",
      },
    ],
    type: "success",
  })
}

function openTxFailedDialog({
  title = "Transaction Reverted",
  description = "Your transaction has failed.",
}: {
  title?: React.ReactNode
  description?: React.ReactNode
} = {}) {
  dialogs.open({
    title,
    children: (
      <div className="space-y-4">
        <div>{description}</div>
      </div>
    ),
    actionButtons: [
      {
        onClick: dialogs.close,
        children: "Close",
        id: "close-tx-completed-dialog",
        className: "w-full",
        rightIcon: true,
      },
    ],
    type: "error",
  })
}

export const tradeService = {
  openTxCompletedDialog,
  openTxFailedDialog,
}
