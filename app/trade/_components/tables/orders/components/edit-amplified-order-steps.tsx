import { useAccount } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useIsTokenInfiniteAllowance } from "@/hooks/use-is-token-infinite-allowance"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { Token } from "@mangrovedao/mangrove.js"
import React from "react"
import { useStep } from "usehooks-ts"
import { formatUnits } from "viem"
import { ApproveStep } from "../../../forms/components/approve-step"
import { Steps } from "../../../forms/components/steps"
import { useSpenderAddress } from "../../../forms/hooks/use-spender-address"
import { useUpdateAmplifiedOrder } from "../hooks/use-update-amplified-order"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm } from "../types"

type SummaryProps = {
  oldAmount: string
  newAmount: string
}

const Summary = ({ oldAmount, newAmount }: SummaryProps) => {
  return (
    <>
      <div className="grid space-y-2">
        <div className="flex justify-between items-center">
          <Label>Volume</Label>
          <div>
            <Label>Old values</Label>
            <Text className="text-muted-foreground">
              {Number(oldAmount).toFixed(4)}
            </Text>
          </div>
          <div>
            <Label>New values</Label>
            <Text className="text-muted-foreground">
              {Number(newAmount).toFixed(4)}
            </Text>
          </div>
        </div>
      </div>
    </>
  )
}

type Props = {
  order: AmplifiedOrder
  form: AmplifiedForm & { sendToken: Token }
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function EditAmplifiedOrderSteps({
  order,
  form,
  onClose,
}: Props) {
  const { chain } = useAccount()

  const { data: spender } = useSpenderAddress("amplified")
  const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance(
    form.sendToken,
    spender,
    form.sendFrom,
  )

  let steps = ["Update amplified orders"]
  if (!isInfiniteAllowance) {
    steps = ["Summary", `Approve ${form?.sendToken?.symbol}`, ...steps]
  }

  const oldAmount = `${Number(
    formatUnits(
      BigInt(order.offers.find((offer) => offer.gives)?.gives || "0"),
      form.sendToken?.decimals ?? 4,
    ),
  ).toFixed(form.sendToken?.displayedDecimals)}`

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  const post = useUpdateAmplifiedOrder({
    bundleId: order.bundleId,
    form,
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
        address: result ?? "",
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
    },
  })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !isInfiniteAllowance && {
      body: <Summary oldAmount={oldAmount} newAmount={form.send} />,
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={form?.sendToken.symbol as string} />,
      button: (
        <Button
          {...btnProps}
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            approve.mutate(
              {
                token: form.sendToken,
                spender,
                logic: form.sendFrom,
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
      body: <Summary oldAmount={oldAmount} newAmount={form.send} />,
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
                onSettled: () => {
                  onClose()
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
    <div className="flex flex-col flex-1 p-3">
      <div className="text-xl text-left">Proceed transaction</div>
      <Steps steps={steps} currentStep={currentStep} />
      <div className="space-y-2 flex flex-col flex-1">
        {stepInfos[currentStep - 1]?.body ?? undefined}
      </div>
      <div className="!mt-8 flex space-x-2 justify-end">
        {stepInfos[currentStep - 1]?.button}
      </div>
    </div>
  )
}
