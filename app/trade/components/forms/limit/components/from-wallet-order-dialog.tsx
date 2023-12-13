import Dialog, { Description, Footer, Title } from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Accordion } from "../../components/accordion"
import { useApproveLimitOrder } from "../hooks/use-approve-limit-order"
import { useStep } from "../hooks/use-step"
import type { Form } from "../types"
import { ApproveStep } from "./approve-step"
import { Steps } from "./steps"
import { SummaryStep } from "./summary-step"

const STEPS = ["Summary", "Approve USDC", "Send"]

type Props = {
  form?: Form
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function FromWalletLimitOrderDialog({ form, onClose }: Props) {
  const [currentStep, helpers] = useStep(STEPS.length)
  const approve = useApproveLimitOrder()
  if (!form) return null

  const { canGoToNextStep, goToNextStep } = helpers

  const stepInfos = [
    {
      title: "Summary",
      body: <SummaryStep />,
      button: (
        <Button
          {...btnProps}
          disabled={!canGoToNextStep}
          onClick={goToNextStep}
        >
          Proceed the payment
        </Button>
      ),
    },
    {
      title: "Approve USDC",
      body: <ApproveStep tokenSymbol="USDC" />,
      button: (
        <Button
          {...btnProps}
          disabled={!canGoToNextStep}
          loading={approve.isPending}
          onClick={() => {
            approve.mutate(
              {
                form,
              },
              {
                onSuccess: goToNextStep,
              },
            )
          }}
        >
          Approve
        </Button>
      ),
    },
    {
      title: "Send",
      body: <SummaryStep />,
      button: (
        <Button
          {...btnProps}
          disabled={!canGoToNextStep}
          onClick={goToNextStep}
        >
          Proceed the payment
        </Button>
      ),
    },
  ]

  return (
    <Dialog open={!!form} onClose={onClose}>
      <Title className="text-xl text-left">Proceed transaction</Title>
      <Steps steps={STEPS} currentStep={currentStep} />
      <Description>
        <div className="space-y-2">
          {stepInfos[currentStep - 1]?.body ?? undefined}
          <div className="bg-[#041010] rounded-lg p-4 flex items-center">
            <Accordion title="Market details" className="text-white text-base">
              <div>TODO</div>
            </Accordion>
          </div>
        </div>
      </Description>
      <Footer>{stepInfos[currentStep - 1]?.button}</Footer>
    </Dialog>
  )
}
