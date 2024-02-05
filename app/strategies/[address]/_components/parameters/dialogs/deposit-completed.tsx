"use client"

import Dialog from "@/components/dialogs/alert-dialog"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { useNetwork } from "wagmi"
import useKandel from "../../../_providers/kandel-strategy"
import BlockExplorer from "../../block-explorer"

type Props = {
  open: boolean
  onClose: () => void
}

export function DepositCompleted({ open, onClose }: Props) {
  const { chain } = useNetwork()
  const { strategyAddress } = useKandel()
  const blockExplorerUrl = chain?.blockExplorers?.default.url

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      showCloseButton={true}
      type="success"
    >
      <Dialog.Title className="text-xl flex justify-center">
        <Title
          as={"div"}
          variant={"header1"}
          className="space-x-3 flex items-center"
        >
          Deposit Completed
        </Title>
      </Dialog.Title>
      <Dialog.Description className="!mt-8 bg-primary-dark-green rounded-lg p-5">
        <BlockExplorer
          blockExplorerUrl={blockExplorerUrl}
          address={strategyAddress}
        />
      </Dialog.Description>
      <Dialog.Footer className="flex !flex-col gap-2 items-baseline">
        <Button className="w-full" size={"lg"}>
          Publish now
        </Button>
        <Button
          variant={"secondary"}
          className="w-full"
          size={"lg"}
          onClick={onClose}
        >
          Close
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
