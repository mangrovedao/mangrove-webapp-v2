"use client"

import Dialog from "@/components/dialogs/alert-dialog"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { useAccount } from "wagmi"
import useKandel from "../../../_providers/kandel-strategy"
import BlockExplorer from "../../block-explorer"

type Props = {
  title: string
  open: boolean
  onClose: () => void
  actionButton?: React.ReactNode
}

export function SuccessDialog({ title, actionButton, open, onClose }: Props) {
  const { chain } = useAccount()
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
          {title}
        </Title>
      </Dialog.Title>
      <Dialog.Description className="!mt-8 bg-primary-dark-green rounded-lg p-5">
        <BlockExplorer
          blockExplorerUrl={blockExplorerUrl}
          address={strategyAddress}
        />
      </Dialog.Description>
      <Dialog.Footer className="flex !flex-col gap-2 items-baseline">
        {actionButton}

        <Button
          className="w-full"
          size={"lg"}
          variant={actionButton ? "secondary" : "primary"}
          onClick={onClose}
        >
          Close
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
