import Dialog from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Accordion } from "../../components/accordion"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { useApproveLimitOrder } from "../hooks/use-approve-limit-order"
import { usePostLimitOrder } from "../hooks/use-post-limit-order"
import { useStep } from "../hooks/use-step"
import type { Form } from "../types"
import { ApproveStep } from "./approve-step"
import { Steps } from "./steps"
import { SummaryStep } from "./summary-step"

const STEPS = ["Summary", "Approve USDC", "Send"]

type Props = {
  form: Form
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
  const post = usePostLimitOrder()

  const {
    baseToken,
    quoteToken,
    sendToken,
    receiveToken,
    feeInPercentageAsString,
    sendTokenBalance,
  } = useTradeInfos("limit", form.tradeAction)

  const { canGoToNextStep, goToNextStep } = helpers

  const stepInfos = [
    {
      title: "Summary",
      body: (
        <SummaryStep
          form={form}
          baseToken={baseToken}
          quoteToken={quoteToken}
          sendToken={sendToken}
          receiveToken={receiveToken}
        />
      ),
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
      body: <ApproveStep tokenSymbol={sendToken?.symbol ?? ""} />,
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
      body: (
        <SummaryStep
          form={form}
          baseToken={baseToken}
          quoteToken={quoteToken}
          sendToken={sendToken}
          receiveToken={receiveToken}
        />
      ),
      button: (
        <Button
          {...btnProps}
          loading={post.isPending}
          onClick={() => {
            post.mutate(
              {
                form,
              },
              {
                onSuccess: onClose,
              },
            )
          }}
        >
          Proceed the payment
        </Button>
      ),
    },
  ]

  return (
    <Dialog open={!!form} onClose={onClose}>
      <Dialog.Title className="text-xl text-left">
        Proceed transaction
      </Dialog.Title>
      <Steps steps={STEPS} currentStep={currentStep} />
      <Dialog.Description>
        <div className="space-y-2">
          {stepInfos[currentStep - 1]?.body ?? undefined}
          <div className="bg-[#041010] rounded-lg p-4 flex items-center">
            <Accordion title="Market details" className="text-white text-base">
              <div>TODO</div>
            </Accordion>
          </div>
        </div>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}
