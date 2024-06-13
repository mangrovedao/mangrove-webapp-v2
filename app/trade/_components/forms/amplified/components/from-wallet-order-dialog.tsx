import type { Token } from "@mangrovedao/mgv"
import { Logic } from "@mangrovedao/mgv"
import React from "react"
import { useAccount } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import Dialog from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { BS } from "@mangrovedao/mgv/lib"
import { useStep } from "../../../../../../hooks/use-step"
import { ActivateRouter } from "../../components/activate-router"
import { ApproveStep } from "../../components/approve-step"
import { DeployRouter } from "../../components/deploy-router"
import { Steps } from "../../components/steps"
import { useActivateSmartContract } from "../../hooks/use-router-bind"
import { useDeploySmartRouter } from "../../hooks/use-router-deploy"
import { useSpenderAddress } from "../../hooks/use-spender-address"
import { useLimitSteps } from "../../limit/hooks/use-steps"
import { usePostAmplifiedOrder } from "../hooks/use-post-amplified-order"
import type { AssetWithInfos, Form } from "../types"
import { SummaryStep } from "./summary-step"

/**
 * Props for the FromWalletOrderDialog component.
 */
type Props = {
  form: Omit<Form, "assets"> & {
    selectedToken?: Token
    selectedSource?: Logic
    sendAmount: string
    assetsWithTokens: AssetWithInfos[]
  }
  onClose: () => void
  isOpen: boolean
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function FromWalletAmplifiedOrderDialog({
  form,
  isOpen,
  onClose,
}: Props) {
  const { selectedToken, selectedSource, sendAmount } = form

  const { chain, address } = useAccount()
  const { data: spender } = useSpenderAddress("amplified")

  const { data: limitOrderSteps } = useLimitSteps({
    user: address,

    bs: BS.buy,
    logic: form.selectedSource?.name,
  })

  // const { isDeployed, isBound } = useSmartRouter().data ?? {}

  let steps = [
    "Summary",
    !limitOrderSteps?.[0].done ? `Approve ${selectedToken?.symbol}` : "",
    false ? "Amplified order deployment" : "",
    !true ? "Amplified order activation" : "",
    "Send",
  ].filter(Boolean)

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  const activate = useActivateSmartContract()
  const deploy = useDeploySmartRouter({})
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
        address: result.transactionHash ?? "",
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
    },
  })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !limitOrderSteps?.[0].done && {
      body: (
        <SummaryStep
          form={form}
          assetsWithToken={form.assetsWithTokens}
          tokenToAmplify={selectedToken}
          sendAmount={sendAmount}
          source={selectedSource!}
        />
      ),
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    !limitOrderSteps?.[0].done && {
      body: <ApproveStep tokenSymbol={selectedToken?.symbol ?? ""} />,
      button: (
        <Button
          {...btnProps}
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            approve.mutate(
              {
                token: selectedToken,
                spender,
                logic: selectedSource,
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
    true && {
      body: <DeployRouter />,
      button: (
        <Button
          {...btnProps}
          disabled={deploy.isPending}
          loading={deploy.isPending}
          onClick={() => {
            deploy.mutate(undefined, {
              onSuccess: goToNextStep,
            })
          }}
        >
          Deploy
        </Button>
      ),
    },
    true && {
      body: <ActivateRouter />,
      button: (
        <Button
          {...btnProps}
          disabled={activate.isPending}
          loading={activate.isPending}
          onClick={() => {
            activate.mutate(undefined, {
              onSuccess: goToNextStep,
            })
          }}
        >
          Activate
        </Button>
      ),
    },
    {
      body: (
        <SummaryStep
          form={form}
          assetsWithToken={form.assetsWithTokens}
          tokenToAmplify={selectedToken}
          sendAmount={sendAmount}
          source={selectedSource!}
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
                onSettled: onClose,
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
    <Dialog open={!!isOpen} onClose={onClose} showCloseButton={false}>
      <Dialog.Title className="text-xl text-left" close>
        Proceed transaction
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
      <Dialog.Description>
        <div className="space-y-2">
          {stepInfos[currentStep - 1]?.body ?? undefined}
        </div>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}
