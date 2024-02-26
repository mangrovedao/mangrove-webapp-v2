import { Token } from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import React from "react"
import { useAccount } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import Dialog from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useIsTokenInfiniteAllowance } from "@/hooks/use-is-token-infinite-allowance"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useStep } from "../../../../../../hooks/use-step"
import { ApproveStep } from "../../components/approve-step"
import { Steps } from "../../components/steps"
import { useSpenderAddress } from "../../hooks/use-spender-address"
import { usePostAmplifiedOrder } from "../hooks/use-post-amplified-order"
import type { Form } from "../types"

type Props = {
  form: Form & {
    selectedToken?: Token
    firstAssetToken?: Token
    secondAssetToken?: Token
    selectedSource?: SimpleLogic | SimpleAaveLogic
    sendAmount: string
  }
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function FromWalletAmplifiedOrderDialog({
  form,
  onClose,
}: Props) {
  const { chain } = useAccount()

  const { data: spender } = useSpenderAddress("amplified")
  const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance({
    // @ts-ignore
    selectedToken: form.selectedToken,
    spender,
    selectedSource: form.selectedSource,
  })

  let steps = ["Send"]
  if (!isInfiniteAllowance) {
    steps = ["Summary", `Approve ${form.selectedToken?.symbol}`, ...steps]
  }

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  const post = usePostAmplifiedOrder({
    onResult: (result) => {
      /*
       * We use a React ref to track the dialog's open state. If the dialog is closed,
       * we prevent further actions. This is necessary because the dialog's closure
       * might occur before the asynchronous operations complete, potentially leading
       * to undesired effects.
       */
      if (!isDialogOpenRef.current) return
      onClose()
      tradeService.openTxCompletedDialog({
        address: result.txReceipt.transactionHash ?? "",
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
    },
  })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !isInfiniteAllowance && {
      body: (
        <div>Summary</div>
        // <SummaryStep
        //   form={form}
        //   sendToken={selectedToken}
        //   receiveToken={firstAssetToken}
        // />
      ),
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={form.selectedToken?.symbol ?? ""} />,
      button: (
        <Button
          {...btnProps}
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            approve.mutate(
              {
                token: form.selectedToken,
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
        <div>Summary</div>
        // <SummaryStep
        //   form={form}
        //   baseToken={baseToken}
        //   quoteToken={quoteToken}
        //   sendToken={sendToken}
        //   receiveToken={receiveToken}
        // />
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
          Proceed
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
    <Dialog open={!!form} onClose={onClose} showCloseButton={false}>
      <Dialog.Title className="text-xl text-left" close>
        Proceed transaction
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
      <Dialog.Description>
        <div className="space-y-2">
          {stepInfos[currentStep - 1]?.body ?? undefined}
          <div className="bg-[#041010] rounded-lg p-4 flex items-center">
            {/* <MarketDetails
              takerFee={feeInPercentageAsString}
              tickSize={tickSize}
            /> */}
          </div>
        </div>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}
