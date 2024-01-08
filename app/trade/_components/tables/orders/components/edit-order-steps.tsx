import React from "react"
import { useNetwork } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useStep } from "../../../../../../hooks/use-step"
import { ApproveStep } from "../../../forms/components/approve-step"
import { Steps } from "../../../forms/components/steps"
import { TradeAction } from "../../../forms/enums"
import { useTradeInfos } from "../../../forms/hooks/use-trade-infos"

import { useUpdateOrder } from "../hooks/use-update-order"
import { Order } from "../schema"
import { Form } from "../types"

type Values = { price: string; volume: string }

type SummaryProps = {
  oldValues: Values
  newValues: Values
}

const Summary = ({ oldValues, newValues }: SummaryProps) => {
  return (
    <div className="grid space-y-2">
      <div className="flex justify-between">
        <Label>Old values</Label>
        <Label>New values</Label>
      </div>
      <div className="flex justify-between">
        <Label>Volume</Label>
        <Text className="text-muted-foreground">
          {Number(oldValues.volume).toFixed(8)}
        </Text>
        <Text>{Number(newValues.volume).toFixed(8)}</Text>
      </div>
      <div className="flex justify-between">
        <Label>Price</Label>
        <Text className="text-muted-foreground">
          {Number(oldValues.price).toFixed(8)}
        </Text>
        <Text>{Number(newValues.price).toFixed(8)}</Text>
      </div>
    </div>
  )
}
type Props = {
  order: Order
  form: Form
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function EditOrderSteps({ order, form, onClose }: Props) {
  const { chain } = useNetwork()
  const {
    baseToken,
    quoteToken,
    sendToken,
    receiveToken,
    isInfiniteAllowance,
    spender,
  } = useTradeInfos("limit", TradeAction.SELL)

  let steps = ["Update order"]
  if (!isInfiniteAllowance) {
    steps = ["Summary", `Approve ${sendToken?.symbol}`, ...steps]
  }

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  const post = useUpdateOrder({
    offerId: order.offerId,
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
      body: (
        <Summary
          oldValues={{
            price: order.price,
            volume: form.isBid ? order.initialGives : order.initialWants,
          }}
          newValues={{ price: form.send, volume: form.send }}
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
        <Summary
          oldValues={{
            price: order.price,
            volume: order.isBid ? order.initialWants : order.initialGives,
          }}
          newValues={{ price: form.send, volume: form.send }}
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
    <div>
      <div className="text-xl text-left">Proceed transaction</div>
      <Steps steps={steps} currentStep={currentStep} />
      <div className="space-y-2">
        {stepInfos[currentStep - 1]?.body ?? undefined}
        <div className="bg-[#041010] rounded-lg p-4 flex items-center"></div>
      </div>
      <div className="!mt-8 flex space-x-2 justify-end">
        {stepInfos[currentStep - 1]?.button}
      </div>
    </div>
  )
}
