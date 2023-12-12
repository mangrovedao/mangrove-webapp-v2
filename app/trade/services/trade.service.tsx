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
        <div>
          Your transaction request has been successfully and securely processed.
        </div>
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
  address,
}: {
  title?: React.ReactNode
  address: string
}) {
  dialogs.open({
    title,
    children: (
      <div className="space-y-4">
        <div>Your transaction request has been reverted.</div>
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
        onClick: () => openTxCompletedDialog({ address }),
        children: "Close",
        id: "close-tx-completed-dialog",
        className: "w-full",
        rightIcon: true,
      },
    ],
    type: "error",
  })
}

// function openTxFailedDialog({
//   title = "Transaction Reverted",
//   address,
// }: {
//   title?: React.ReactNode
//   address: string
// }) {
//   dialogs.open({
//     title,
//     children: (
//       <div className="space-y-4">
//         <div>Your transaction request has been reverted.</div>
//         <div className="bg-primary-dark-green rounded-lg py-3 px-4 flex items-center justify-between">
//           <span>View on block explorer</span>

//           <Button
//             className="flex items-center space-x-1 underline"
//             variant={"link"}
//             onClick={() => {
//               address && navigator.clipboard.writeText(address)
//               toast.success("Address copied to clipboard")
//             }}
//           >
//             <span>{shortenAddress(address ?? "")}</span>
//             <Copy className="mr-2 h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     ),
//     actionButtons: [
//       {
//         onClick: () => alert("hello"),
//         children: "Close",
//         id: "close-tx-completed-dialog",
//         className: "w-full",
//         rightIcon: true,
//       },
//     ],
//     type: "error",
//   })
// }

export const tradeService = {
  openTxCompletedDialog,
  openTxFailedDialog,
}
