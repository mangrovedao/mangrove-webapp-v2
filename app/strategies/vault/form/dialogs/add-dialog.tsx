import { Token } from "@mangrovedao/mgv"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useStep } from "@/hooks/use-step"
import useMarket from "@/providers/market.new"
import { Steps } from "../components/steps"

type Props = {
  baseAmount: string
  quoteAmount: string
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function AddToVaultDialog({
  isOpen,
  onClose,
  baseAmount,
  quoteAmount,
}: Props) {
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const { base: baseToken, quote: quoteToken } = currentMarket ?? {}
  const { data: nativeBalance } = useBalance({
    address,
  })
  const { data: spender } = useSpenderAddress("kandel")

  const approveToken = useInfiniteApproveToken()

  let steps = [
    "Summary",
    true ? `Approve ${baseToken?.symbol}` : "",
    true ? `Approve ${quoteToken?.symbol}` : "",
    "Mint",
  ].filter(Boolean)

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers
  const stepInfos = [
    {
      body: (
        <Summary
          baseAmount="0"
          quoteAmount="0"
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
    true && {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={baseToken?.symbol || ""} />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={approveToken.isPending}
          loading={approveToken.isPending}
          onClick={() => {
            approveToken.mutate(
              {
                token: baseToken,
                spender,
              },
              {
                onSuccess: goToNextStep,
              },
            )
          }}
        >
          Approve {baseToken?.symbol}
        </Button>
      ),
    },
    true && {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={quoteToken?.symbol || ""} />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={approveToken.isPending}
          loading={approveToken.isPending}
          onClick={() => {
            approveToken.mutate(
              {
                token: quoteToken,
                spender,
              },
              {
                onSuccess: goToNextStep,
              },
            )
          }}
        >
          Approve {quoteToken?.symbol}
        </Button>
      ),
    },
    {
      body: (
        <Summary
          baseAmount="0"
          quoteAmount="0"
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
          onClick={() => {}}
        >
          Mint
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

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!isOpen

    return () => {
      isDialogOpenRef.current = false
    }
  }, [isOpen])

  return (
    <Dialog
      open={!!isOpen}
      onClose={() => {
        reset()
        onClose()
      }}
      showCloseButton={false}
    >
      <Dialog.Title className="text-xl text-left" close>
        Add to vault
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
  return (
    <div className="flex justify-between text-primary mt-4">
      <Text className="text-muted-foreground">{title}</Text>
      {value}
    </div>
  )
}

const Summary = ({
  baseToken,
  quoteToken,
  nativeBalance,
  quoteAmount,
  baseAmount,
}: {
  baseAmount: string
  quoteAmount: string
  baseToken?: Token
  quoteToken?: Token
  nativeBalance?: string
}) => {
  return (
    <div className="space-y-2">
      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        />

        <Separator className="mt-4" />

        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseAmount).toFixed(baseToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">{baseToken?.symbol}</Text>
            </div>
          }
        />

        <SummaryLine
          title={`${quoteToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(quoteAmount).toFixed(quoteToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>
    </div>
  )
}
