import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import useMarket from "@/providers/market.new"
import { useCancelAmplifiedOrder } from "../hooks/use-cancel-amplified-order"
import type { AmplifiedOrder } from "../schema"

type Props = {
  order?: AmplifiedOrder
  market?: ReturnType<typeof useMarket>
  onClose: () => void
}

export default function CancelAmplifiedOfferDialog({
  order,
  market,
  onClose,
}: Props) {
  const retract = useCancelAmplifiedOrder({
    offerId: order?.id,
    onCancel: onClose,
  })

  if (!order) return null

  return (
    <Dialog open={!!order} onClose={onClose} type="info">
      <Dialog.Title>Are you sure you want to cancel this order? </Dialog.Title>
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
      </Dialog.Footer>
    </Dialog>
  )
}
