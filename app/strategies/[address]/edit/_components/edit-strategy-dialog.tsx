import { KandelParams, Token } from "@mangrovedao/mgv"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"

import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button-old"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useStep } from "@/hooks/use-step"
import { NewStratStore } from "../../../new/_stores/new-strat.store"
import { useCloseStrategy } from "../../_hooks/use-close-strategy"
import { useKandelSteps } from "../../_hooks/use-kandel-steps"
import useKandel from "../../_providers/kandel-strategy"
import { useEditKandelStrategy } from "../_hooks/use-edit-kandel-strategy"
import { Steps } from "./form/components/steps"

type StrategyDetails = Omit<
  NewStratStore,
  "isChangingFrom" | "globalError" | "errors" | "priceRange"
> & { onAave?: boolean; riskAppetite?: string; priceRange?: [number, number] }

type Props = {
  strategy?: StrategyDetails & {
    hasLiveOffers?: boolean
    kandelParams?: KandelParams
  }
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

export default function EditStrategyDialog({
  isOpen,
  onClose,
  strategy,
}: Props) {
  const { address, chain } = useAccount()

  const { data: nativeBalance } = useBalance({
    address,
  })

  const { strategyQuery, baseToken, quoteToken } = useKandel()
  const kandelAddress = strategyQuery.data?.address

  const { data: kandelSteps } = useKandelSteps({
    liquiditySourcing: strategy?.sendFrom,
    kandelAddress: kandelAddress,
  })

  const [sow, baseApprove, quoteApprove, populateParams] = kandelSteps ?? [{}]

  const approveBaseToken = useInfiniteApproveToken()
  const approveQuoteToken = useInfiniteApproveToken()

  const { mutate: retractOffers, isPending: isRetractingOffers } =
    useCloseStrategy({ strategyAddress: kandelAddress })

  const kandelClient = useKandelInstance({
    address: kandelAddress,
    base: baseToken?.address,
    quote: quoteToken?.address,
  })

  const { mutate: editKandelStrategy, isPending: isEditingKandelStrategy } =
    useEditKandelStrategy(kandelClient)

  let steps = [
    "Summary",
    !baseApprove?.done ? `Approve ${baseToken?.symbol}` : "",
    !quoteApprove?.done ? `Approve ${quoteToken?.symbol}` : "",
    strategy?.hasLiveOffers ? "Reset strategy" : "",
    "Publish",
  ].filter(Boolean)

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, goToPrevStep, reset } = helpers
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

    !baseApprove?.done && {
      body: (
        <div className="text-center">
          <ApproveStep
            tokenSymbol={baseToken?.symbol || ""}
            contractAddress={kandelAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={approveBaseToken.isPending}
          loading={approveBaseToken.isPending}
          onClick={() => {
            approveBaseToken.mutate(
              {
                token: baseToken,
                spender: kandelAddress,
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

    !quoteApprove?.done && {
      body: (
        <div className="text-center">
          <ApproveStep
            tokenSymbol={quoteToken?.symbol || ""}
            contractAddress={kandelAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={approveQuoteToken.isPending}
          loading={approveQuoteToken.isPending}
          onClick={() => {
            approveQuoteToken.mutate(
              {
                token: quoteToken,
                spender: kandelAddress,
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

    strategy?.hasLiveOffers && {
      body: (
        <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
          <div className="flex justify-center items-center"></div>
          <h1 className="text-2xl text-white">Reset strategy</h1>
          <p className="text-base text-gray-scale-300">
            By granting permission, you are allowing mangrove to reset this
            strategy.
          </p>
        </div>
      ),
      button: (
        <div className="grid gap-2 w-full ">
          <Button
            {...btnProps}
            disabled={isRetractingOffers}
            loading={isRetractingOffers}
            onClick={() => {
              if (!strategy) return

              retractOffers(undefined, {
                onSuccess: goToNextStep,
              })
            }}
          >
            Activate
          </Button>
          <Button
            size={"lg"}
            variant={"secondary"}
            disabled={isRetractingOffers}
            onClick={() => goToPrevStep()}
          >
            Back
          </Button>
        </div>
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
          loading={isEditingKandelStrategy}
          disabled={isEditingKandelStrategy}
          onClick={() => {
            if (!strategy) return

            const { kandelParams, bountyDeposit } = strategy

            editKandelStrategy(
              {
                bountyDeposit,
                kandelParams,
              },
              {
                onSuccess: () => {
                  onClose()
                  // next/redirect doesn't work in this case...
                  window.location.href = `/strategies/${kandelAddress}`
                },
              },
            )
          }}
        >
          Publish strategy
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
        Edit Strategy
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
    numberOfOffers,
    stepSize,
    bountyDeposit,
    priceRange,
    riskAppetite,
    onAave,
  } = strategy ?? {}

  const [minPrice, maxPrice] = priceRange ?? []

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
          title="Liquidity source"
          value={<Text>{onAave ? "Aave" : "Wallet"}</Text>}
        />

        <SummaryLine title="Risk appetite" value={<Text>Medium</Text>} />

        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseDeposit).toFixed(baseToken?.displayDecimals) || 0}
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
                {Number(quoteDeposit).toFixed(quoteToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        <SummaryLine
          title={`Min price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{minPrice?.toFixed(quoteToken?.displayDecimals)}</Text>
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
              <Text>{maxPrice?.toFixed(quoteToken?.displayDecimals)}</Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>

      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        <SummaryLine
          title={`Nb. of offers`}
          value={<Text>{numberOfOffers}</Text>}
        />
        <SummaryLine title={`Step Size`} value={<Text>{stepSize}</Text>} />
      </div>

      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
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
