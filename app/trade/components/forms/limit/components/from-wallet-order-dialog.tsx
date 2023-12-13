import Dialog, { Description, Footer, Title } from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { Accordion } from "../../components/accordion"
import { useApproveLimitOrder } from "../hooks/use-approve-limit-order"
import type { Form } from "../types"
import { Steps } from "./steps"
import { TradeSummary } from "./trade-summary"

type Props = {
  form?: Form
  onClose: () => void
}

export default function FromWalletLimitOrderDialog({ form, onClose }: Props) {
  const approve = useApproveLimitOrder()
  if (!form) return null

  return (
    <Dialog open={!!form} onClose={onClose}>
      <Title className="text-xl text-left">Proceed transaction</Title>
      <Steps steps={["Summary", "Approve USDC", "Send"]} currentStep={1} />
      <Description>
        <div className="space-y-2">
          <TradeSummary />
          <div className="bg-[#041010] rounded-lg p-4 flex items-center">
            <Accordion title="Market details" className="text-white text-base">
              <div>TODO</div>
            </Accordion>
          </div>
        </div>
      </Description>
      <Footer>
        <Button
          rightIcon
          className="w-full"
          size="lg"
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            if (!form) return
            approve.mutate(
              {
                form,
              },
              {
                onSuccess: onClose,
              },
            )
          }}
        >
          Approve
        </Button>
      </Footer>
    </Dialog>
  )
}
