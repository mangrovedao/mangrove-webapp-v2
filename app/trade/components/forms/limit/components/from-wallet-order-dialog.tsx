import Dialog, { Description, Footer, Title } from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import { useApproveLimitOrder } from "../hooks/use-approve-limit-order"
import type { Form } from "../types"
import { Steps } from "./steps"

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
      <Steps
        steps={["Summary", "Approve USDC", "Approve DAI", "Send"]}
        currentStep={1}
      />
      <Description>
        By granting permission, you are allowing the following contract to
        access your funds.
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
