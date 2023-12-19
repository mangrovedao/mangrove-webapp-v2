import type { Market } from "@mangrovedao/mangrove.js"

import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { useRetractOrder } from "../hooks/use-retract-order"
import type { Order } from "../schema"

type Props = {
  order?: Order
  market?: Market
  onClose: () => void
}

export default function RetractOfferDialog({ order, market, onClose }: Props) {
  const retract = useRetractOrder({
    offerId: order?.offerId,
    onRetract: onClose,
  })
  if (!order || !market) return null

  return (
    <Dialog open={!!order} onClose={onClose}>
      <Dialog.Title>Retract an offer</Dialog.Title>
      <Dialog.Description>
        Are you sure to retract the offer?
      </Dialog.Description>
      <Dialog.Footer>
        <Button
          rightIcon
          className="w-full"
          size="lg"
          disabled={retract.isPending}
          loading={retract.isPending}
          onClick={() => {
            if (!(order && market)) return
            retract.mutate({
              order,
              market,
            })
          }}
        >
          Retract
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
