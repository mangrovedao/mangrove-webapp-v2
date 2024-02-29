import { useAccount } from "wagmi"

import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import React from "react"
import { useStep } from "usehooks-ts"
import { ApproveStep } from "../../../forms/components/approve-step"
import { Steps } from "../../../forms/components/steps"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm } from "../types"

type Values = { price: string; volume: string }

type SummaryProps = {
  oldOffers: AmplifiedOrder["offers"]
  newOffers: {
    limitPrice: string
    receiveAmount: string
  }[]
  displayDecimals: number
}

const Summary = ({ oldOffers, newOffers, displayDecimals }: SummaryProps) => {
  return (
    <>
      <div className="grid space-y-2">
        <div className="flex justify-between items-center">
          <Label>Volume</Label>
          <div>
            <Label>Old values</Label>
            {oldOffers.map((offer, i) => (
              <Text className="text-muted-foreground">
                {Number(offer.gives).toFixed(displayDecimals)}
              </Text>
            ))}
          </div>

          <div>
            <Label>New values</Label>
            {newOffers.map((offer, i) => (
              <Text className="text-muted-foreground">
                {Number(offer.limitPrice).toFixed(displayDecimals)}
              </Text>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Label>Price</Label>

          <Text className="text-muted-foreground">
            {oldOffers.map((offer, i) => (
              <Text className="text-muted-foreground">
                {Number(offer.price).toFixed(displayDecimals)}
              </Text>
            ))}
          </Text>
          {newOffers.map((offer, i) => (
            <Text className="text-muted-foreground">
              {Number(offer.limitPrice).toFixed(displayDecimals)}
            </Text>
          ))}
        </div>
      </div>
    </>
  )
}
type Props = {
  order: AmplifiedOrder
  form: AmplifiedForm
  onClose: () => void
  displayDecimals: number
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
  displayDecimals,
}: Props) {
  const { chain } = useAccount()

  // const { data: spender } = useSpenderAddress("amplified")
  // const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance(
  //   send,
  //   spender,
  //   selectedSource,
  // )

  let steps = ["Update order"]
  // if (!isInfiniteAllowance) {
  //   steps = ["Summary", `Approve ${sendToken?.symbol}`, ...steps]
  // }

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!form

    return () => {
      isDialogOpenRef.current = false
    }
  }, [form])

  const approve = useInfiniteApproveToken()
  // const post = useUpdateOrder({
  //   offerId: order.offerId,
  //   form,
  //   onResult: (result) => {
  //     /*
  //      * We use a React ref to track the dialog's open state. If the dialog is closed,
  //      * we prevent further actions. This is necessary because the dialog's closure
  //      * might occur before the asynchronous operations complete, potentially leading
  //      * to undesired effects.
  //      */
  //     if (!isDialogOpenRef.current) return
  //     onClose()
  //     tradeService.openTxCompletedDialog({
  //       address: result ?? "",
  //       blockExplorerUrl: chain?.blockExplorers?.default.url,
  //     })
  //   },
  // })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    !false && {
      body: (
        <Summary
          displayDecimals={displayDecimals}
          oldOffers={order.offers}
          newOffers={form.assets}
        />
      ),
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    !false && {
      body: <ApproveStep tokenSymbol={""} />,
      button: (
        <Button
          {...btnProps}
          disabled={approve.isPending}
          loading={approve.isPending}
          onClick={() => {
            // approve.mutate(
            //   {
            //     token: sendToken,
            //     spender,
            //   },
            //   {
            //     onSuccess: goToNextStep,
            //   },
            // )
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
          oldOffers={order.offers}
          newOffers={form.assets}
        />
      ),
      button: (
        <Button
          {...btnProps}
          // loading={post.isPending}
          // disabled={post.isPending}
          onClick={() => {
            // post.mutate(
            //   {
            //     form,
            //   },
            //   {
            //     onError: (error: Error) => {
            //       onClose()
            //       tradeService.openTxFailedDialog(
            //         getTitleDescriptionErrorMessages(error),
            //       )
            //     },
            //   },
            // )
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
