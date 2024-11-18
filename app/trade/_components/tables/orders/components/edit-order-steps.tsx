import React from "react"
import { useAccount } from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button-old"
import { Label } from "@/components/ui/label"
import { useLogics } from "@/hooks/use-addresses"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { BS } from "@mangrovedao/mgv/lib"
import { useStep } from "../../../../../../hooks/use-step"
import { ApproveStep } from "../../../forms/components/approve-step"
import { Steps } from "../../../forms/components/steps"
import { useTradeInfos } from "../../../forms/hooks/use-trade-infos"
import { useLimitSteps } from "../../../forms/limit/hooks/use-steps"
import { useUpdateOrder } from "../hooks/use-update-order"
import { Order } from "../schema"
import { Form } from "../types"

type Values = { price: string; volume: string }
type decimals = { volume?: number; price?: number }

type SummaryProps = {
  oldValues: Values
  newValues: Values
  displayDecimals?: decimals
}

const Summary = ({ oldValues, newValues, displayDecimals }: SummaryProps) => {
  return (
    <div className="grid space-y-2">
      <div className="flex justify-between items-center">
        <Label>Volume</Label>
        <div>
          <Label>Old values</Label>
          <Text className="text-muted-foreground">
            {Number(oldValues.volume).toFixed(displayDecimals?.volume)}
          </Text>
        </div>

        <div>
          <Label>New values</Label>
          <Text>
            {Number(newValues.volume).toFixed(displayDecimals?.volume)}
          </Text>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Label>Price</Label>
        <div>
          <Label>Old values</Label>
          <Text className="text-muted-foreground">
            {Number(oldValues.price).toFixed(displayDecimals?.price)}
          </Text>
        </div>

        <div>
          <Label>New values</Label>
          <Text>{Number(newValues.price).toFixed(displayDecimals?.price)}</Text>
        </div>
      </div>
    </div>
  )
}

type Props = {
  order: Order
  form: Form
  onClose: () => void
  onCloseForm: () => void
  displayDecimals?: decimals
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function EditOrderSteps({
  order,
  form,
  onClose,
  onCloseForm,

  displayDecimals,
}: Props) {
  const { chain, address } = useAccount()
  const logics = useLogics()

  const { sendToken, spender } = useTradeInfos(
    "limit",
    order.isBid ? BS.buy : BS.sell,
  )

  const orderLogic = logics.find((item) => item.logic == order.outboundRoute)

  const { data: limitOrderSteps } = useLimitSteps({
    user: address,
    bs: BS.buy,
    logic: orderLogic?.name,
  })

  let steps = ["Update order"]
  if (!limitOrderSteps?.[0].done) {
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
      onCloseForm()
      tradeService.openTxCompletedDialog({
        address: result ?? "",
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
    },
  })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !limitOrderSteps?.[0].done && {
      body: (
        <Summary
          displayDecimals={displayDecimals}
          oldValues={{
            price: order.price,
            volume: order.initialGives,
          }}
          newValues={{ price: form.limitPrice, volume: form.send }}
        />
      ),
      button: (
        <>
          <Button onClick={onCloseForm} variant={"secondary"}>
            Back
          </Button>
          <Button {...btnProps} onClick={goToNextStep}>
            Proceed
          </Button>
        </>
      ),
    },
    !limitOrderSteps?.[0].done && {
      body: (
        <ApproveStep
          tokenSymbol={sendToken?.symbol ?? ""}
          contractAddress={spender ?? ""}
          explorerUrl={chain?.blockExplorers?.default.url}
        />
      ),
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
          displayDecimals={displayDecimals}
          oldValues={{
            price: order.price,
            volume: order.initialGives,
          }}
          newValues={{ price: form.limitPrice, volume: form.send }}
        />
      ),
      button: (
        <>
          <Button
            onClick={onCloseForm}
            variant={"secondary"}
            disabled={post.isPending}
          >
            Back
          </Button>
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
        </>
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
    <div className="flex flex-col flex-1">
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
