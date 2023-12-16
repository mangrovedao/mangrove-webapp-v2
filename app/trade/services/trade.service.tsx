import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { dialogs } from "@/services/dialogs.service"
import { shortenAddress } from "@/utils/wallet"

// open the alert dialog saying that the network is wrong
function openTxCompletedDialog({
  title = "Transaction Completed",
  address,
}: {
  title?: React.ReactNode
  address: string
}) {
  dialogs.open({
    title,
    children: (
      <div className="space-y-4">
        <div className="bg-primary-dark-green rounded-lg py-3 px-4 flex items-center justify-between">
          <span>View on block explorer</span>

          <Button
            className="flex items-center space-x-1 underline"
            variant={"link"}
            onClick={() => {
              address && navigator.clipboard.writeText(address)
              toast.success("Address copied to clipboard")
            }}
          >
            <span>{shortenAddress(address ?? "")}</span>
            <Copy className="mr-2 h-4 w-4" />
          </Button>
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

function openConfirmRetractOrder({
  title = "Confirm Retract Order",
  children = "Are you sure you want to retract this order?",
  onConfirm,
}: {
  title?: React.ReactNode
  children?: React.ReactNode
  onConfirm: () => void
}) {
  dialogs.open({
    title,
    children,
    actionButtons: [
      {
        onClick: onConfirm,
        children: "Confirm",
        id: "confirm-retract",
        className: "w-full",
        rightIcon: true,
      },
    ],
    type: "confirm",
  })
}

export const tradeService = {
  openTxCompletedDialog,
  openTxFailedDialog,
  openConfirmRetractOrder,
}
