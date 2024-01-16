import React from "react"
import { useNetwork } from "wagmi"

import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"

import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStep } from "@/hooks/use-step"
import { Token } from "@mangrovedao/mangrove.js"
import { Steps } from "./form/components/steps"
import { useStrategyInfos } from "./form/hooks/use-strategy-infos"

type Props = {
  strategy?: {
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
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}
const SummaryLine = ({
  title,
  value,
}: {
  title?: string
  value?: React.ReactNode
}) => {
  return (
    <div className="flex justify-between text-primary mt-4">
      <Text className="text-muted-foreground"> {title}</Text>
      {value}
    </div>
  )
}

export default function DeployStrategyDialog({
  isOpen,
  onClose,
  strategy,
}: Props) {
  const { chain } = useNetwork()
  const { baseToken, quoteToken, isInfiniteAllowance } = useStrategyInfos()

  let steps = [
    strategy?.onAave ? `Approve a${baseToken?.symbol}` : "",
    strategy?.onAave ? `Approve a${quoteToken?.symbol}` : "",
    "Deposit",
  ]

  if (!isInfiniteAllowance) {
    steps = [
      "Summary",
      `Approve ${baseToken?.symbol}`,
      `Approve ${quoteToken?.symbol}`,
      ...steps,
    ]
  }

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
      body: <Summary infos={{ base: baseToken, quote: quoteToken }} />,
      button: (
        <Button {...btnProps} onClick={goToNextStep}>
          Proceed
        </Button>
      ),
    },
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={baseToken?.symbol ?? ""} />,
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
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={quoteToken?.symbol ?? ""} />,
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
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={quoteToken?.symbol ?? ""} />,
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
    !isInfiniteAllowance && {
      body: <ApproveStep tokenSymbol={baseToken?.symbol ?? ""} />,
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
      body: <Summary infos={{ base: baseToken, quote: quoteToken }} />,
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

const Summary = ({ infos }: { infos: { base?: Token; quote?: Token } }) => {
  const { base, quote } = infos
  return (
    <div className="space-y-2">
      <div className="bg-[#041010] rounded-lg p-4">
        <TokenPair
          baseToken={base}
          quoteToken={quote}
          tokenClasses="w-[28px] h-[28px]"
        />
        <Separator className="mt-4" />
        <SummaryLine title="Liquidity source" value={<Text>Aave</Text>} />
        <SummaryLine title="Risk appetite" value={<Text>Medium</Text>} />
        <SummaryLine
          title={`${base?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>0.0004</Text>
              <Text className="text-muted-foreground">{base?.symbol}</Text>
            </div>
          }
        />
        <SummaryLine
          title={`${quote?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>1.23</Text>
              <Text className="text-muted-foreground">{quote?.symbol}</Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine
          title={`Min price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>1.23</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
        <SummaryLine
          title={`Max price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>1.23</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine title={`No. of price points`} value={<Text>10</Text>} />
        <SummaryLine title={`Ratio`} value={<Text>2.4</Text>} />
        <SummaryLine title={`Step Size`} value={<Text>1</Text>} />
      </div>
      <div className="bg-[#041010] rounded-lg p-4">
        <SummaryLine
          title={`Bounty`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>1.23</Text>
              <Text className="text-muted-foreground">USDC</Text>
            </div>
          }
        />
      </div>
    </div>
  )
}
