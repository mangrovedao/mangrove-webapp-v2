import { Token } from "@mangrovedao/mangrove.js"
import { useRouter } from "next/navigation"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useStep } from "@/hooks/use-step"
import useMarket from "@/providers/market"
import useKandel from "../../_providers/kandel-strategy"
import { useApproveKandelStrategy } from "../_hooks/use-approve-kandel-strategy"
import { useEditKandelStrategy } from "../_hooks/use-edit-kandel-strategy"
import { useRetractOffers } from "../_hooks/use-retract-offers"
import { NewStratStore } from "../_stores/new-strat.store"
import { ApproveStep } from "./form/components/approve-step"
import { Steps } from "./form/components/steps"

type StrategyDetails = Omit<
  NewStratStore,
  "isChangingFrom" | "globalError" | "errors" | "priceRange"
> & { onAave?: boolean; riskAppetite?: string; priceRange?: [number, number] }

type Props = {
  strategy?: StrategyDetails & { hasLiveOffers?: boolean }
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
  const { address } = useAccount()
  const { market } = useMarket()
  const { base: baseToken, quote: quoteToken } = market ?? {}

  const { data: nativeBalance } = useBalance({
    address,
  })
  const { strategyQuery } = useKandel()
  const kandelAddress = strategyQuery.data?.address
  const router = useRouter()

  const {
    mutate: approveKandelStrategy,
    isPending: isApprovingKandelStrategy,
  } = useApproveKandelStrategy({
    kandelAddress,
  })

  const { mutate: retractOffers, isPending: isRetractingOffers } =
    useRetractOffers({ kandelAddress })

  const { mutate: editKandelStrategy, isPending: isEditingKandelStrategy } =
    useEditKandelStrategy()

  let steps = [
    "Summary",
    `Approve ${baseToken?.symbol}/${quoteToken?.symbol}`,
    strategy?.hasLiveOffers ? "Retract Offers" : "",
    "Deposit",
  ].filter(Boolean)

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers
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
      body: (
        <div className="text-center">
          <ApproveStep
            baseToken={baseToken}
            baseDeposit={strategy?.baseDeposit}
            quoteToken={quoteToken}
            quoteDeposit={strategy?.quoteDeposit}
          />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isApprovingKandelStrategy}
          loading={isApprovingKandelStrategy}
          onClick={() => {
            if (!strategy) return
            const { baseDeposit, quoteDeposit } = strategy
            approveKandelStrategy(
              {
                baseDeposit,
                quoteDeposit,
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

    strategy?.hasLiveOffers && {
      body: (
        <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
          <div className="flex justify-center items-center"></div>
          <h1 className="text-2xl text-white">Retract live offers</h1>
          <p className="text-base text-gray-scale-300">
            By granting permission, you are allowing the following contract to
            retract existing offers.
          </p>
        </div>
      ),
      button: (
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
          Retract
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
          loading={isEditingKandelStrategy}
          disabled={isEditingKandelStrategy}
          onClick={() => {
            if (!strategy) return

            const {
              baseDeposit,
              quoteDeposit,
              distribution,
              bountyDeposit,
              stepSize,
              pricePoints,
            } = strategy

            editKandelStrategy(
              {
                kandelAddress,
                baseDeposit,
                quoteDeposit,
                distribution,
                bountyDeposit,
                stepSize,
                pricePoints,
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
      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
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
          value={<Text>{riskAppetite?.toUpperCase()}</Text>}
        />

        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseDeposit).toFixed(baseToken?.decimals) || 0}
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
                {Number(quoteDeposit).toFixed(quoteToken?.decimals) || 0}
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

      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        <SummaryLine
          title={`No. of price points`}
          value={<Text>{pricePoints}</Text>}
        />
        <SummaryLine title={`Ratio`} value={<Text>{ratio}</Text>} />
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
