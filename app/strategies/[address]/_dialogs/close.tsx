import { AlertCircle } from "lucide-react"

import Dialog from "@/components/dialogs/dialog"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import useMarket from "@/providers/market"
import { Close } from "@/svgs"
import useKandel from "../../(list)/_providers/kandel-strategies"
import { useCloseStrategy } from "../_hooks/actions/use-close-strategy"
import useKandelContext from "../_providers/kandel-strategy"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CloseDialog({ isOpen, onClose }: Props) {
  const { getMarketFromAddresses } = useMarket()
  const { kandelStrategies } = useKandel()
  const { strategyQuery } = useKandelContext()
  const { base, quote, address: strategyAddress } = strategyQuery.data ?? {}

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
          <Title>Are you sure you want to close this strategy</Title>
          <Text>You can re-open it at any time.</Text>
          <Text>
            Funds will be withdrawn from the strategy and returned to your
            wallet.
          </Text>
        </div>
      </Dialog.Description>
      <Dialog.Footer center>
        <Button
          className="w-full"
          onClick={() => {
            closeStrategy.mutate({
              getMarketFromAddresses,
              kandelStrategies,
              base,
              quote,
            })
          }}
          disabled={closeStrategy.isPending}
          loading={closeStrategy.isPending}
        >
          Yes, close strategy
        </Button>
        <Button
          className="w-full"
          variant={"secondary"}
          disabled={closeStrategy.isPending}
        >
          No, cancel
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
