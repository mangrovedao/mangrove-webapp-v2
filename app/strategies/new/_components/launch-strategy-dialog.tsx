import { KandelParams, Token } from "@mangrovedao/mgv"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button-old"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useStep } from "@/hooks/use-step"
import useMarket from "@/providers/market"
import { useKandelSteps } from "../../[address]/_hooks/use-kandel-steps"
import { useCreateKandelStrategy } from "../_hooks/use-deploy-kandel-strategy"
import { useLaunchKandelStrategy } from "../_hooks/use-launch-kandel-strategy"
import { NewStratStore } from "../_stores/new-strat.store"
import { Steps } from "./form/components/steps"

type StrategyDetails = Omit<
  NewStratStore,
  "isChangingFrom" | "globalError" | "errors" | "priceRange"
> & {
  riskAppetite?: string
  strategyType?: string
  priceRange?: [number, number]
  kandelParams?: KandelParams
}

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
  const { address, chain } = useAccount()
  const { currentMarket } = useMarket()
  const { base: baseToken, quote: quoteToken } = currentMarket ?? {}

  const { data: nativeBalance } = useBalance({
    address,
  })

  const {
    mutate: createKandelStrategy,
    isPending: createKandelStrategyPending,
    data,
  } = useCreateKandelStrategy({ liquiditySourcing: strategy?.sendFrom })

  const { data: kandelSteps } = useKandelSteps({
    liquiditySourcing: strategy?.sendFrom,
    kandelAddress: data?.kandelAddress,
  })

  const [sow, baseApprove, quoteApprove, populateParams] = kandelSteps ?? [{}]

  const approveToken = useInfiniteApproveToken()
  const launchKandelStrategy = useLaunchKandelStrategy(data?.kandelAddress)

  let steps = [
    "Summary",
    "Create strategy instance",
    !baseApprove?.done ? `Approve ${baseToken?.symbol}` : "",
    !quoteApprove?.done ? `Approve ${quoteToken?.symbol}` : "",
    "Launch strategy",
  ].filter(Boolean)

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset, goToPrevStep } = helpers
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
        <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
          <div className="flex justify-center items-center">
            Create kandel instance
          </div>
          <h1 className="text-2xl text-white">
            Allow Mangrove to create your kandel instance?
          </h1>
          <p className="text-base text-gray-scale-300">
            By approving this transaction you're deploying a new kandel contract
          </p>
        </div>
      ),
      button: (
        <div className="grid gap-2 w-full ">
          <Button
            {...btnProps}
            disabled={createKandelStrategyPending}
            loading={createKandelStrategyPending}
            onClick={() => {
              createKandelStrategy(undefined, {
                onSuccess: goToNextStep,
              })
            }}
          >
            Create kandel instance
          </Button>
          <Button
            size={"lg"}
            variant={"secondary"}
            onClick={() => goToPrevStep()}
            disabled={createKandelStrategyPending}
          >
            Return
          </Button>
        </div>
      ),
    },

    !baseApprove?.done && {
      body: (
        <div className="text-center">
          <ApproveStep
            tokenSymbol={baseToken?.symbol || ""}
            contractAddress={data?.kandelAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
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
                spender: data?.kandelAddress,
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
            contractAddress={data?.kandelAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
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
                spender: data?.kandelAddress,
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
          strategy={strategy}
          baseToken={baseToken}
          quoteToken={quoteToken}
          nativeBalance={nativeBalance?.symbol}
        />
      ),
      button: (
        <Button
          {...btnProps}
          loading={launchKandelStrategy.isPending}
          disabled={launchKandelStrategy.isPending}
          onClick={() => {
            if (!strategy) return

            const { kandelParams, bountyDeposit } = strategy

            launchKandelStrategy.mutate(
              {
                kandelParams,
                bountyDeposit,
              },
              {
                onSuccess: () => {
                  onClose()
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
    sendFrom,
  } = strategy ?? {}

  const onAave = sendFrom === "Aave"
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
