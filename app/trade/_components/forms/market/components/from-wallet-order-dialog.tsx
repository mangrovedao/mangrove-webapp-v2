import React from "react"
import { toast } from "sonner"
import { Address, parseEther } from "viem"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import Dialog from "@/components/dialogs/dialog-new"
import { TokenIcon } from "@/components/token-icon-new"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { getExactWeiAmount } from "@/utils/regexp"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useStep } from "../../../../../../hooks/use-step"
import { ApproveStep } from "../../components/approve-step"
import { Steps } from "../../components/steps"
import { useTradeInfos } from "../../hooks/use-trade-infos"
import { usePostMarketOrder } from "../hooks/use-post-market-order"
import { useMarketSteps } from "../hooks/use-steps"
import type { Form } from "../types"
import { SummaryStep } from "./summary-step"

type Props = {
  form: Form & { totalWrapping: number }
  onClose: () => void
}

const btnProps: ButtonProps = {
  className: "w-full",
  size: "lg",
}

export const wethAdresses: { [key: number]: Address | undefined } = {
  168587773: "0x4200000000000000000000000000000000000023",
  81457: "0x4300000000000000000000000000000000000004",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
}

export default function FromWalletMarketOrderDialog({ form, onClose }: Props) {
  const { chain, address } = useAccount()
  const {
    baseToken,
    quoteToken,
    sendToken,
    receiveToken,
    spender,
    feeInPercentageAsString,
    spotPrice,
  } = useTradeInfos("market", form.bs)

  const {
    data: wrappingHash,
    isPending: isPendingWrapping,
    sendTransaction,
  } = useSendTransaction()

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: wrappingHash,
  })
  const { data: marketOrderSteps } = useMarketSteps({
    user: address,
    bs: form.bs,
    sendAmount: form.send,
    sendToken,
  })

  let steps = ["Send"]
  if (!marketOrderSteps?.[0].done) {
    steps = ["Summary", `Approve ${sendToken?.symbol}`, ...steps]
  }

  if (form.totalWrapping > 0) {
    steps = ["Wrap ETH", ...steps]
  }

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  React.useEffect(() => {
    if (wrappingHash) {
      goToNextStep()
      toast.success("ETH wrapped successfully!")
    }
  }, [wrappingHash])

  const approve = useInfiniteApproveToken()
  const post = usePostMarketOrder({
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

  const { goToNextStep, goToPrevStep } = helpers

  const stepInfos = [
    !marketOrderSteps?.[0].done && {
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
    form.totalWrapping > 0 && {
      body: (
        <div className="border border-border-secondary rounded-lg p-4 space-y-8">
          <div className="flex justify-center items-center">
            <TokenIcon
              className="w-12 h-12 flex justify-center items-center"
              imgClasses="w-12 h-12"
              symbol={"ETH"}
            />
          </div>
          <h1 className="text-2xl text-white text-center">
            Wrap your ETH to continue with the trade
          </h1>
          <p className="text-base text-gray-scale-300">
            This step is required to convert{" "}
            {getExactWeiAmount(form.totalWrapping.toString(), 3)} ETH to WETH
          </p>
        </div>
      ),
      button: (
        <div className="flex gap-2 w-full">
          <Button
            size={"lg"}
            variant={"secondary"}
            onClick={() => goToPrevStep()}
            disabled={isPendingWrapping}
          >
            Back
          </Button>
          <Button
            {...btnProps}
            className="flex-1"
            onClick={() =>
              sendTransaction({
                to: wethAdresses[chain?.id ?? 0],
                value: parseEther(form.totalWrapping.toString()),
              })
            }
            disabled={isPendingWrapping}
          >
            Wrap ETH
          </Button>
        </div>
      ),
    },
    !marketOrderSteps?.[0].done && {
      body: (
        <ApproveStep
          tokenSymbol={sendToken?.symbol ?? ""}
          contractAddress={spender ?? ""}
          explorerUrl={chain?.blockExplorers?.default.url}
        />
      ),
      button: (
        <div className="flex gap-2 w-full ">
          <Button
            size={"lg"}
            variant={"secondary"}
            onClick={() => goToPrevStep()}
            disabled={approve.isPending}
          >
            Back
          </Button>
          <Button
            {...btnProps}
            className="flex-1"
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
        </div>
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
                form: {
                  ...form,
                  send:
                    baseToken?.symbol === "WETH"
                      ? (Number(form.send) - 0.0000001).toString()
                      : form.send,
                },
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
          Confirm
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
      <Dialog.Title className="flex end" close>
        Proceed transaction
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
      <Dialog.Description className="p-4 space-y-2">
        <div className="space-y-2">
          {stepInfos[currentStep - 1]?.body ?? undefined}
        </div>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}
