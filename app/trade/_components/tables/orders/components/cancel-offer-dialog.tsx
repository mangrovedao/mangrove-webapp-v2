import Dialog from "@/components/dialogs/dialog-new"
import { Button } from "@/components/ui/button"
import useMarket from "@/providers/market"
import { useCancelOrder } from "../hooks/use-cancel-order"
import type { Order } from "../schema"

type Props = {
  order?: Order
  market?: ReturnType<typeof useMarket>
  onClose: () => void
}

export default function CancelOfferDialog({ order, market, onClose }: Props) {
  const retract = useCancelOrder({
    offerId: order?.offerId,
    onCancel: onClose,
  })
  if (!order || !market) return null

  return (
    <Dialog
      open={!!order}
      onClose={onClose}
      type="info"
      showCloseButton={false}
      className="p-4"
    >
      <Dialog.Title className="border-none">
        Are you sure you want to cancel this order?
      </Dialog.Title>
      <Dialog.Description className="p-4">
        <div className="flex flex-col gap-4 flex-1">
          <Button
            className="w-full"
            size="lg"
            disabled={retract.isPending}
            loading={retract.isPending}
            onClick={() => {
              retract.mutate({
                order,
                market: { ...market },
              })
            }}
          >
            Yes, cancel order
          </Button>
          <Dialog.Close>
            <Button variant={"secondary"} className="w-full" size="lg">
              No, cancel
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Description>
    </Dialog>
  )
}
