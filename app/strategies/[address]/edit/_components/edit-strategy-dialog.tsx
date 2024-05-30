import { Logic, Token } from "@mangrovedao/mgv"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { useKandelSeeder } from "@/app/strategies/(shared)/_hooks/use-kandel-seeder"
import { useKandelSteps } from "@/app/strategies/(shared)/_hooks/use-kandel-steps"
import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLogics } from "@/hooks/use-addresses"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useStep } from "@/hooks/use-step"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import { NewStratStore } from "../../../new/_stores/new-strat.store"
import useKandel from "../../_providers/kandel-strategy"
import { useEditKandelStrategy } from "../_hooks/use-edit-kandel-strategy"
import { useRetractOffers } from "../_hooks/use-retract-offers"
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
  const { currentMarket: market } = useMarket()
  const { mangrove } = useMangrove()
  const { base: baseToken, quote: quoteToken } = market ?? {}

  const { data: nativeBalance } = useBalance({
    address,
  })
  const { strategyQuery } = useKandel()
  const kandelAddress = strategyQuery.data?.address

  const approveBaseToken = useInfiniteApproveToken()
  const approveQuoteToken = useInfiniteApproveToken()

  const { mutate: retractOffers, isPending: isRetractingOffers } =
    useRetractOffers({ kandelAddress })

  const { mutate: editKandelStrategy, isPending: isEditingKandelStrategy } =
    useEditKandelStrategy()

  const logics = useLogics()

  const baseLogic = logics.find((logic) => logic?.name === strategy?.sendFrom)
  const quoteLogic = logics.find((logic) => logic?.name === strategy?.receiveTo)

  const { data: spender } = useSpenderAddress("kandel")
  const { data: kandelSeeder } = useKandelSeeder()
  const { data: kandelSteps } = useKandelSteps({ seeder: kandelSeeder })

  let steps = [
    "Summary",
    // TODO: apply liquidity sourcing with setLogics
    // TODO: if sendFrom v3 logic selected then it'll the same it the other side for receive
    // TODO: if erc721 approval, add select field with available nft ids then nft.approveForAll
    !kandelSteps?.[4].done ? `Approve ${baseToken?.symbol}` : "",
    !kandelSteps?.[5].done ? `Approve ${quoteToken?.symbol}` : "",
    strategy?.hasLiveOffers ? "Reset strategy" : "",
    "Publish",
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

    !kandelSteps?.[4].done && {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={baseToken?.symbol || ""} />
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
                logic: baseLogic as Logic,
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
    !kandelSteps?.[5].done && {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={quoteToken?.symbol || ""} />
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
                logic: quoteLogic as Logic,
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
    strategy?.hasLiveOffers && {
      body: (
        <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
          <div className="flex justify-center items-center"></div>
          <h1 className="text-2xl text-white">Reset strategy</h1>
          <p className="text-base text-gray-scale-300">
            By granting permission, you are allowing the following contract to
            reset this strategy.
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
          Reset
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
              numberOfOffers,
            } = strategy

            // editKandelStrategy(
            //   {
            //     kandelAddress,
            //     baseDeposit,
            //     quoteDeposit,
            //     distribution,
            //     bountyDeposit,
            //     stepSize,
            //     numberOfOffers,
            //   },
            //   {
            //     onSuccess: () => {
            //       onClose()
            //       // next/redirect doesn't work in this case...
            //       window.location.href = `/strategies/${kandelAddress}`
            //     },
            //   },
            // )
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
