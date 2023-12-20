import type { Market } from "@mangrovedao/mangrove.js"

import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { useCancelOrder } from "../hooks/use-cancel-order"
import type { Order } from "../schema"

type Props = {
  order?: Order
  market?: Market
  onClose: () => void
}

export default function CancelOfferDialog({ order, market, onClose }: Props) {
  const retract = useCancelOrder({
    offerId: order?.offerId,
    onCancel: onClose,
  })
  if (!order || !market) return null

  return (
    // TODO: info
    <Dialog open={!!order} onClose={onClose} type="info">
      <Dialog.Title>Are you sure you want to cancel this order? </Dialog.Title>
      <Dialog.Description>
        Funds used to place the order will be returned to your account. It may
        take a few minutes.
      </Dialog.Description>
      <Dialog.Footer>
        <div className="flex flex-col gap-4 flex-1">
          <Button
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
            Yes, cancel order
          </Button>
          <Dialog.Close>
            <Button
              variant={"secondary"}
              className="w-full"
              size="lg"
              disabled={retract.isPending}
              loading={retract.isPending}
            >
              No, cancel
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}
