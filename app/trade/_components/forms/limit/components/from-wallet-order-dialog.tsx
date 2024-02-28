import React from "react"
import { useAccount } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import Dialog from "@/components/dialogs/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import useMangrove from "@/providers/mangrove"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useStep } from "../../../../../../hooks/use-step"
import { ActivateRouter } from "../../components/activate-router"
import { ApproveStep } from "../../components/approve-step"
import { DeployRouter } from "../../components/deploy-router"
import { MarketDetails } from "../../components/market-details"
import { Steps } from "../../components/steps"
import { useActivateSmartContract } from "../../hooks/use-router-bind"
import { useDeploySmartRouter } from "../../hooks/use-router-deploy"
import { useSmartRouter } from "../../hooks/use-smart-router"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { usePostLimitOrder } from "../hooks/use-post-limit-order"
import type { Form } from "../types"
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
  const { chain } = useAccount()
  const {
    baseToken,
    quoteToken,
    sendToken,
    receiveToken,
    isInfiniteAllowance,
    spender,
    feeInPercentageAsString,
    tickSize,
    spotPrice,
  } = useTradeInfos("limit", form.tradeAction)
  const { isDeployed, isBound } = useSmartRouter().data ?? {}

  let steps = [] as string[]
  if (!isInfiniteAllowance) {
    steps = ["Summary", `Approve ${sendToken?.symbol}`, ...steps]
  }

  if (isDeployed) {
    steps = [...steps, "Limit order deployment"]
  }

  if (!isBound) {
    steps = [...steps, "Limit order activation"]
  }
  steps = [...steps, "Send"]

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  const activate = useActivateSmartContract()
  const deploy = useDeploySmartRouter()
  const post = usePostLimitOrder({
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

  const { mangrove } = useMangrove()
  const logics = mangrove ? Object.values(mangrove.logics) : []
  const logic = logics.find((logic) => logic?.id === form.sendFrom)

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
          Proceed
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
                //@ts-ignore
                logic,
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
    isDeployed && {
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
    !isBound && {
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
            <MarketDetails
              spotPrice={spotPrice}
              takerFee={feeInPercentageAsString}
              tickSize={tickSize}
            />
          </div>
        </div>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}
