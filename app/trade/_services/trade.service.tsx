import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { dialogs } from "@/services/dialogs.service"
import { shortenAddress } from "@/utils/wallet"
import Link from "next/link"

// open the alert dialog saying that the network is wrong
function openTxCompletedDialog({
  title = "Transaction Completed",
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
        <div className="bg-primary-dark-green rounded-lg py-3 px-4 flex items-center justify-between">
          {blockExplorerUrl && (
            <Link
              className="hover:opacity-80 transition-all"
              target="_blank"
              href={`${blockExplorerUrl}/tx/${address}`}
            >
              <span>View on block explorer</span>{" "}
            </Link>
          )}

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

export const tradeService = {
  openTxCompletedDialog,
  openTxFailedDialog,
}
