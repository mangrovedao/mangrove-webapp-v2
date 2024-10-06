import { AlertCircle } from "lucide-react"

import Dialog from "@/components/dialogs/dialog"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { Close } from "@/svgs"
import { useCloseStrategy } from "../../../_hooks/use-close-strategy"

type Props = {
  isOpen: boolean
  strategyAddress: string
  onClose: () => void
}

export default function CloseStrategyDialog({
  isOpen,
  onClose,
  strategyAddress,
}: Props) {
  const closeStrategy = useCloseStrategy({ strategyAddress })

  return (
    <Dialog open={!!isOpen} onClose={onClose} showCloseButton={false}>
      <Dialog.Title className="flex justify-center">
        <Dialog.Close className="absolute right-4 top-4">
          <Close />
        </Dialog.Close>
        <div className="bg-primary-dark-green p-2 rounded-lg max-w-fit">
          <AlertCircle className="text-green-caribbean w-9 h-9" />
        </div>
      </Dialog.Title>
      <Dialog.Description>
        <div className="flex flex-col space-y-2 mt-9">
          <Title>Are you sure you want to close this strategy ?</Title>
          <Text>You can re-open it at any time.</Text>
        </div>
      </Dialog.Description>
      <Dialog.Footer>
        <Button
          className="w-full"
          onClick={() => {
            closeStrategy.mutate(undefined, { onSuccess: () => onClose() })
          }}
          disabled={closeStrategy.isPending}
          loading={closeStrategy.isPending}
          size={"lg"}
        >
          Yes, close strategy
        </Button>
        <Button
          onClick={onClose}
          className="w-full"
          variant={"secondary"}
          disabled={closeStrategy.isPending}
          size={"lg"}
        >
          No, cancel
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
