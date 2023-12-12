import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { alertDialogs } from "@/services/alert-dialogs.service"
import { shortenAddress } from "@/utils/wallet"

// open the alert dialog saying that the network is wrong
function openTxCompletedDialog({
  title = "Transaction Completed",
  address = "0x1234567890123456789012345678901234567890",
}: {
  title?: React.ReactNode
  address: string
}) {
  alertDialogs.open({
    title,
    children: (
      <div className="space-y-4">
        <div>
          Your transaction request has been successfully and securely processed.
        </div>
        <div className="bg-primary-dark-green rounded-lg px-3 py-4 flex items-center justify-between">
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
        onClick: alertDialogs.close,
        children: "Close",
        id: "close-tx-completed-dialog",
        className: "w-full",
      },
    ],
    type: "success",
  })
}

export const tradeService = {
  openTxCompletedDialog,
}
