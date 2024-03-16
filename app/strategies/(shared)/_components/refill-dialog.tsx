import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { MergedOffer } from "../../[address]/_utils/inventory"
import { useRefillOffer } from "../_hooks/use-refill-offer"

type Props = {
  offer?: MergedOffer
  onClose: () => void
}

export default function RefillOfferDialog({ offer, onClose }: Props) {
  if (!offer) return null

  const refill = useRefillOffer({
    offer,
    onCancel: onClose,
  })

  return (
    <Dialog open={!!offer} onClose={onClose} type="info">
      <Dialog.Title>Are you sure you want to refill this order? </Dialog.Title>
      <Dialog.Footer>
        <div className="flex flex-col gap-4 flex-1">
          <Button
            className="w-full"
            size="lg"
            disabled={refill.isPending}
            loading={refill.isPending}
            onClick={() => {
              refill.mutate()
            }}
          >
            Yes, refill offer
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
