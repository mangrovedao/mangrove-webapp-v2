import { useNetwork } from "wagmi"

import { tradeService } from "@/app/trade/services/trade.service"
import Dialog from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useStep } from "../../../../../../hooks/use-step"
import { Accordion } from "../../components/accordion"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { usePostLimitOrder } from "../hooks/use-post-limit-order"
import type { Form } from "../types"
import { ApproveStep } from "./approve-step"
import { Steps } from "./steps"
import { SummaryStep } from "./summary-step"

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
  const { chain } = useNetwork()
  const {
    baseToken,
    quoteToken,
    sendToken,
    receiveToken,
    isInfiniteAllowance,
    spender,
  } = useTradeInfos("limit", form.tradeAction)

  let steps = ["Send"]
  if (!isInfiniteAllowance) {
    steps = ["Summary", `Approve ${sendToken?.symbol}`, ...steps]
  }

  const approve = useInfiniteApproveToken()
  const post = usePostLimitOrder()

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !isInfiniteAllowance && {
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
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed the payment
        </Button>
      ),
    },
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={sendToken?.symbol ?? ""} />,
      button: (
        <Button
          {...btnProps}
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            approve.mutate(
              {
                token: sendToken,
                spender,
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
          disabled={post.isPending}
          onClick={() => {
            post.mutate(
              {
                form,
              },
              {
                onSuccess: (data) => {
                  onClose()
                  tradeService.openTxCompletedDialog({
                    address: data?.txReceipt.transactionHash ?? "",
                    blockExplorerUrl: chain?.blockExplorers?.default.url,
                  })
                },
                onError: (error: Error) => {
                  onClose()
                  tradeService.openTxFailedDialog(
                    getTitleDescriptionErrorMessages(error),
                  )
                },
              },
            )
          }}
        >
          Proceed the payment
        </Button>
      ),
    },
  ]
    .filter(Boolean)
    .map((stepInfo, i) => {
      return {
        ...stepInfo,
        title: steps[i],
      }
    })

  return (
    <Dialog open={!!form} onClose={onClose}>
      <Dialog.Title className="text-xl text-left">
        Proceed transaction
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
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
