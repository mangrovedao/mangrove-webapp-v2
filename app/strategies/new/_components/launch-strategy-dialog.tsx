import React from "react"
import { useAccount, useBalance } from "wagmi"

import { ActivateRouter } from "@/app/trade/_components/forms/components/activate-router"
import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import Dialog from "@/components/dialogs/dialog"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { useStep } from "@/hooks/use-step"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import { KandelSteps, Token } from "@mangrovedao/mgv"
import { useActivateStrategySmartRouter } from "../../(shared)/_hooks/use-activate-smart-router"
import { useKandelSeeder } from "../../(shared)/_hooks/use-kandel-seeder"
import { useKandelSteps } from "../../(shared)/_hooks/use-kandel-steps"
import { useStrategySmartRouter } from "../../(shared)/_hooks/use-smart-router"
import { useCreateKandelStrategy } from "../_hooks/use-approve-kandel-strategy"
import { useLaunchKandelStrategy } from "../_hooks/use-launch-kandel-strategy"
import { NewStratStore } from "../_stores/new-strat.store"
import { Steps } from "./form/components/steps"

type StrategyDetails = Omit<
  NewStratStore,
  "isChangingFrom" | "globalError" | "errors" | "priceRange"
> & { riskAppetite?: string; priceRange?: [number, number] }

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
  const { currentMarket } = useMarket()
  const { mangrove } = useMangrove()
  const { base: baseToken, quote: quoteToken } = currentMarket ?? {}
  const { data: kandelSeeder } = useKandelSeeder()

  const { data: kandelSteps } = useKandelSteps({ seeder: kandelSeeder })

  const [sow, deploRouter, bind, setLogics, baseApprove, quoteApprove] =
    kandelSteps ?? ({} as KandelSteps)

  console.log(sow, deploRouter, bind, setLogics, baseApprove, quoteApprove)

  const { data: nativeBalance } = useBalance({
    address,
  })

  const [kandelAddress, setKandelAddress] = React.useState("")

  const { mutate: createKandelStrategy, isPending: isCreatingKandelStrategy } =
    useCreateKandelStrategy({
      setKandelAddress: (address) => setKandelAddress(address),
    })

  const approveBaseToken = useInfiniteApproveToken()
  const approveQuoteToken = useInfiniteApproveToken()
  const activateSmartRouter = useActivateStrategySmartRouter(kandelAddress)

  const { mutate: launchKandelStrategy, isPending: isLaunchingKandelStrategy } =
    useLaunchKandelStrategy()

  const logics = mangrove ? Object.values(mangrove.logics) : []

  const baseLogic = logics.find((logic) => logic?.id === strategy?.sendFrom)
  const quoteLogic = logics.find((logic) => logic?.id === strategy?.receiveTo)

  const { data: spender } = useSpenderAddress("kandel")

  const { isBound } = useStrategySmartRouter({ kandelAddress }).data ?? {}

  let steps = [
    "Summary",
    "Create strategy instance",
    !isBound ? "Activate router" : "",
    // TODO: apply liquidity sourcing with setLogics
    // TODO: if sendFrom v3 logic selected then it'll the same it the other side for receive
    // TODO: if erc721 approval, add select field with available nft ids then nft.approveForAll
    !baseApprove.done ? `Approve ${baseToken?.symbol}` : "",
    !quoteApprove.done ? `Approve ${quoteToken?.symbol}` : "",
    "Launch strategy",
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
        <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
          <div className="flex justify-center items-center">
            Create kandel instance
          </div>
          <h1 className="text-2xl text-white">
            Allow Mangrove to create your kandel instance?
          </h1>
          <p className="text-base text-gray-scale-300">
            By granting permission, you are allowing the following contract to
            access your funds.
          </p>
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isCreatingKandelStrategy}
          loading={isCreatingKandelStrategy}
          onClick={() => {
            createKandelStrategy(undefined, {
              onSuccess: goToNextStep,
            })
          }}
        >
          Create kandel instance
        </Button>
      ),
    },

    !isBound && {
      body: <ActivateRouter />,
      button: (
        <Button
          {...btnProps}
          disabled={activateSmartRouter.isPending}
          loading={activateSmartRouter.isPending}
          onClick={() => {
            activateSmartRouter.mutate(undefined, {
              onSuccess: goToNextStep,
            })
          }}
        >
          Activate
        </Button>
      ),
    },

    !baseApprove.done && {
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
            // approveBaseToken.mutate(
            //   {
            //     token: baseToken,
            //     logic: baseLogic,
            //     spender,
            //   },
            //   {
            //     onSuccess: goToNextStep,
            //   },
            // )
          }}
        >
          Approve {baseToken?.symbol}
        </Button>
      ),
    },
    !quoteApprove.done && {
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
            // approveQuoteToken.mutate(
            //   {
            //     token: quoteToken,
            //     logic: quoteLogic,
            //     spender,
            //   },
            //   {
            //     onSuccess: goToNextStep,
            //   },
            // )
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
          loading={isLaunchingKandelStrategy}
          disabled={isLaunchingKandelStrategy}
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

            launchKandelStrategy(
              {
                kandelAddress,
                baseDeposit,
                quoteDeposit,
                distribution,
                bountyDeposit,
                stepSize,
                numberOfOffers,
                baseLogic,
                quoteLogic,
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
  } = strategy ?? {}

  const [minPrice, maxPrice] = priceRange ?? []

  return (
    <div className="space-y-2">
      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        {/* <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        /> */}

        <Separator className="mt-4" />

        <SummaryLine
          title="Liquidity source"
          value={<Text>{false ? "Aave" : "Wallet"}</Text>}
        />

        <SummaryLine
          title="Risk appetite"
          value={<Text>{riskAppetite?.toUpperCase()}</Text>}
        />

        {/* <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseDeposit).toFixed(baseToken?.displayedDecimals) || 0}
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
                {Number(quoteDeposit).toFixed(quoteToken?.displayedDecimals) ||
                  0}
              </Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        /> */}
      </div>

      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        {/* <SummaryLine
          title={`Min price`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>{minPrice?.toFixed(quoteToken?.displayedDecimals)}</Text>
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
              <Text>{maxPrice?.toFixed(quoteToken?.displayedDecimals)}</Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        /> */}
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
