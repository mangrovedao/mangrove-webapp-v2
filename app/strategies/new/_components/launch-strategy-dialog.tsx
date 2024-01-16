import { Token } from "@mangrovedao/mangrove.js"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useStep } from "@/hooks/use-step"

import { useStrategyInfos } from "../_hooks/use-strategy-infos"
import { NewStratStore } from "../_stores/new-strat.store"
import { ApproveStep } from "./form/components/approve-step"
import { Steps } from "./form/components/steps"

type StrategyDetails = Omit<
  NewStratStore,
  "isChangingFrom" | "globalError" | "errors" | "distribution" | "priceRange"
> & { onAave?: boolean; riskAppetite?: string; priceRange?: [number, number] }

type Props = {
  strategy?: StrategyDetails
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
  const { address } = useAccount()
  const { baseToken, quoteToken, isInfiniteBase, isInfiniteQuote } =
    useStrategyInfos()

  const { data: nativeBalance } = useBalance({
    address,
  })

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
          nativeBalance={nativeBalance?.symbol}
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
          nativeBalance={nativeBalance?.symbol}
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
        <ScrollArea className="h-full" scrollHideDelay={200}>
          <ScrollBar orientation="vertical" className="z-50" />

          {stepInfos[currentStep - 1]?.body ?? undefined}
        </ScrollArea>
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
  nativeBalance,
}: {
  strategy?: StrategyDetails
  baseToken?: Token
  quoteToken?: Token
  nativeBalance?: string
}) => {
  const {
    baseDeposit,
    quoteDeposit,
    ratio,
    pricePoints,
    stepSize,
    bountyDeposit,
    priceRange,
    riskAppetite,
  } = strategy ?? {}

  const [minPrice, maxPrice] = priceRange ?? []

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
          value={<Text>{false ? "Aave" : "Wallet"}</Text>}
        />
        <SummaryLine
          title="Risk appetite"
          value={<Text>{riskAppetite}</Text>}
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
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
        <SummaryLine
          title={`Max price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{maxPrice}</Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
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
              <Text className="text-muted-foreground">{nativeBalance}</Text>
            </div>
          }
        />
      </div>
    </div>
  )
}
