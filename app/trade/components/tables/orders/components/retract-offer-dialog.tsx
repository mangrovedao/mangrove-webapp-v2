import type { Market } from "@mangrovedao/mangrove.js"

import Dialog, { Description, Footer, Title } from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { useRetractOrder } from "../hooks/use-retract-order"
import type { Order } from "../schema"

type Props = {
  order?: Order
  market?: Market
  onClose: () => void
}

export default function RetractOfferDialog({ order, market, onClose }: Props) {
  const { mutate, isPending } = useRetractOrder()
  if (!order || !market) return null

  return (
    <Dialog open={!!order} onClose={onClose}>
      <Title>Retract an offer</Title>
      <Description>Are you sure to retract the offer?</Description>
      <Footer>
        <Button
          rightIcon
          className="w-full"
          size="lg"
          disabled={isPending}
          loading={isPending}
          onClick={() => {
            if (!(order && market)) return
            mutate(
              {
                order,
                market,
              },
              {
                onSuccess: onClose,
              },
            )
          }}
        >
          Retract
        </Button>
      </Footer>
    </Dialog>
  )
}
