import React from "react"
import { useNetwork } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStep } from "@/hooks/use-step"
import { Token } from "@mangrovedao/mangrove.js"
import { ApproveStep } from "./form/components/approve-step"
import { Steps } from "./form/components/steps"
import { useStrategyInfos } from "./form/hooks/use-strategy-infos"

type Strategy = {
  onAave: false
  risk: string
  baseDeposit: string
  quoteDeposit: string
  minPrice: string
  maxPrice: string
  pricePoints: string
  ratio: string
  stepSize: string
  bountyDeposit: string
}

type Props = {
  strategy?: Strategy
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function DeployStrategyDialog({
  isOpen,
  onClose,
  strategy,
}: Props) {
  const { chain } = useNetwork()
  const { baseToken, quoteToken, isInfiniteBase, isInfiniteQuote } =
    useStrategyInfos()

  let steps = [
    "Summary",
    `Approve ${baseToken?.symbol}/${quoteToken?.symbol}`,
    "Deposit",
  ]

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!isOpen

    return () => {
      isDialogOpenRef.current = false
    }
  }, [isOpen])

  //   const approve = useInfiniteApproveToken()
  //   const post = usePostLimitOrder({
  //     onResult: (result) => {
  //       /*
  //        * We use a React ref to track the dialog's open state. If the dialog is closed,
  //        * we prevent further actions. This is necessary because the dialog's closure
  //        * might occur before the asynchronous operations complete, potentially leading
  //        * to undesired effects.
  //        */
  //       if (!isDialogOpenRef.current) return
  //       onClose()
  //       tradeService.openTxCompletedDialog({
  //         address: result.txReceipt.transactionHash ?? "",
  //         blockExplorerUrl: chain?.blockExplorers?.default.url,
  //       })
  //     },
  //   })

  const [currentStep, helpers] = useStep(steps.length)

  const { goToNextStep } = helpers

  const stepInfos = [
    {
      body: (
        <Summary
          strategy={strategy}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    {
      body: <ApproveStep baseToken={baseToken} quoteToken={quoteToken} />,
      button: (
        <Button
          {...btnProps}
          disabled={false}
          loading={false}
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
          strategy={strategy}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button
          {...btnProps}
          loading={false}
          disabled={false}
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
    <Dialog open={!!isOpen} onClose={onClose} showCloseButton={false}>
      <Dialog.Title className="text-xl text-left" close>
        Launch Strategy
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
      <Dialog.Description>
        {stepInfos[currentStep - 1]?.body ?? undefined}
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}

const SummaryLine = ({
  title,
  value,
}: {
  title?: string
  value?: React.ReactNode
}) => {
  if (!value) return
  return (
    <div className="flex justify-between text-primary mt-4">
      <Text className="text-muted-foreground">{title}</Text>
      {value}
    </div>
  )
}

const Summary = ({
  strategy,
  baseToken,
  quoteToken,
}: {
  strategy?: Strategy
  baseToken?: Token
  quoteToken?: Token
}) => {
  const {
    baseDeposit,
    quoteDeposit,
    ratio,
    pricePoints,
    stepSize,
    bountyDeposit,
    minPrice,
    maxPrice,
    risk,
    onAave,
  } = strategy ?? {}

  return (
    <div className="space-y-2">
      <div className="bg-[#041010] rounded-lg p-4">
        <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        />
        <Separator className="mt-4" />
        <SummaryLine
          title="Liquidity source"
          value={<Text>{onAave ? "Aave" : "Wallet"}</Text>}
        />
        <SummaryLine
          title="Risk appetite"
          value={<Text>{risk?.toUpperCase()}</Text>}
        />
        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{baseDeposit}</Text>
              <Text className="text-muted-foreground">{baseToken?.symbol}</Text>
            </div>
          }
        />
        <SummaryLine
          title={`${quoteToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{quoteDeposit}</Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine
          title={`Min price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{minPrice}</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
        <SummaryLine
          title={`Max price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{maxPrice}</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine
          title={`No. of price points`}
          value={<Text>{pricePoints}</Text>}
        />
        <SummaryLine title={`Ratio`} value={<Text>{ratio}</Text>} />
        <SummaryLine title={`Step Size`} value={<Text>{stepSize}</Text>} />
      </div>
      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine
          title={`Bounty`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{bountyDeposit}</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
      </div>
    </div>
  )
}
