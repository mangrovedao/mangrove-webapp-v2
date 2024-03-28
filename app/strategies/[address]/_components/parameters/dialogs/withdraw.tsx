"use client"

import { LucideChevronRight } from "lucide-react"
import React from "react"
import { useAccount } from "wagmi"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { ApproveStep } from "@/app/strategies/new/_components/form/components/approve-step"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import { useCreateKandelStrategy } from "@/app/strategies/new/_hooks/use-approve-kandel-strategy"
import Dialog from "@/components/dialogs/dialog"
import InfoTooltip from "@/components/info-tooltip"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { KANDEL_DOC_URL } from "@/constants/docs"
import { useStep } from "@/hooks/use-step"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import Link from "next/link"
import useKandel from "../../../_providers/kandel-strategy"
import { useWithDraw } from "../mutations/use-withdraw"
import { SuccessDialog } from "./succes-dialog"

type Props = {
  open: boolean
  onClose: () => void
}

export function Withdraw({ open, onClose }: Props) {
  const [withdrawCompleted, toggleWithdrawCompleted] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  const { strategyQuery, strategyStatusQuery, strategyAddress } = useKandel()

  const { address } = useAccount()

  const { market } = strategyStatusQuery.data ?? {}

  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: market?.base.symbol,
    quote: market?.quote.symbol,
    offers: strategyQuery.data?.offers,
  })
  const getUnpublishedBalances = async () => {
    const asks =
      await strategyStatusQuery.data?.stratInstance.getUnpublished("asks")
    const bids =
      await strategyStatusQuery.data?.stratInstance.getUnpublished("bids")

    return { asks, bids }
  }

  let steps = [
    "Set",
    `Approve ${market?.base?.symbol}/${market?.quote?.symbol}`,
    "Withdraw",
  ]

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers

  const [baseAmount, setBaseAmount] = React.useState("")
  const [quoteAmount, setQuoteAmount] = React.useState("")

  const [upublishedBase, setUnpublishedBase] = React.useState("")
  const [upublishedQuote, setUnpublishedQuote] = React.useState("")

  React.useEffect(() => {
    const fetchUnpublishedBalances = async () => {
      try {
        const { asks, bids } = await getUnpublishedBalances()
        if (!asks || !bids) return

        setUnpublishedBase(asks.toFixed(market?.base.decimals))
        setUnpublishedQuote(bids.toFixed(market?.quote.decimals))
      } catch (error) {
        console.error("Error fetching unpublished balances:", error)
      }
    }

    fetchUnpublishedBalances()
  }, [strategyStatusQuery.data])

  const approve = useCreateKandelStrategy({
    setKandelAddress: (address) => address,
  })

  const withdraw = useWithDraw({
    stratInstance: strategy?.stratInstance,
    volumes: { baseAmount, quoteAmount },
  })

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBaseAmount(upublishedBase),
            }}
            value={baseAmount}
            label={`${market?.base.symbol} amount`}
            customBalance={upublishedBase}
            showBalance
            balanceLabel="Unpublished inventory"
            token={market?.base}
            onChange={(e) => setBaseAmount(e.target.value)}
            error={
              Number(baseAmount) > Number(upublishedBase)
                ? "Invalid amount"
                : ""
            }
          />

          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setQuoteAmount(upublishedQuote),
            }}
            value={quoteAmount}
            label={`${market?.quote.symbol} amount`}
            customBalance={upublishedQuote}
            balanceLabel="Unpublished inventory"
            onChange={(e) => setQuoteAmount(e.target.value)}
            error={
              Number(quoteAmount) > Number(upublishedQuote)
                ? "Invalid amount"
                : ""
            }
            token={market?.quote}
            showBalance
          />
        </div>
      ),

      button: (
        <Button
          disabled={
            !baseAmount ||
            !quoteAmount ||
            Number(baseAmount) > Number(upublishedBase) ||
            Number(quoteAmount) > Number(upublishedQuote)
          }
          onClick={goToNextStep}
          className="w-full flex items-center justify-center !mt-6"
          size={"lg"}
        >
          Proceed{" "}
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": !baseAmount || !quoteAmount,
              },
            )}
          >
            <LucideChevronRight className="h-4 w-4 text-current" />
          </div>
        </Button>
      ),
    },
    {
      body: (
        <div className="text-center">
          <ApproveStep
            baseToken={market?.base}
            quoteToken={market?.quote}
            baseDeposit={baseAmount}
            quoteDeposit={quoteAmount}
          />
        </div>
      ),
      button: (
        <Button
          className="w-full flex items-center justify-center !mt-6"
          disabled={approve.isPending}
          loading={approve.isPending}
          size={"lg"}
          onClick={() => {
            approve.mutate(undefined, {
              onSuccess: goToNextStep,
            })
          }}
        >
          Approve
        </Button>
      ),
    },
    {
      body: (
        <div className="grid gap-2 p-5 bg-primary-dark-green rounded-lg">
          <Title>Review</Title>
          <div className="flex justify-between">
            <Text>{market?.base.symbol} amount</Text>
            <Text className="text-primary">
              {baseAmount} {market?.base.symbol}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text>{market?.quote.symbol} amount</Text>
            <Text className="text-primary">
              {quoteAmount} {market?.quote.symbol}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text>Send to</Text>
            <Text className="text-primary">
              Wallet {shortenAddress(address ?? "")}
            </Text>
          </div>
        </div>
      ),

      button: (
        <Button
          disabled={withdraw.isPending}
          loading={withdraw.isPending}
          onClick={() =>
            withdraw.mutate(undefined, {
              onSuccess() {
                toggleWithdrawCompleted()
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
        >
          Withdraw
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": withdraw.isPending,
              },
            )}
          >
            <LucideChevronRight className="h-4 w-4 text-current" />
          </div>
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
    <>
      <SuccessDialog
        title={"Withdraw completed"}
        open={withdrawCompleted}
        onClose={toggleWithdrawCompleted}
      />

      <Dialog open={!!open} onClose={onClose} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <div className="flex space-x-2 items-center">
            <Title
              as={"div"}
              variant={"header1"}
              className="space-x-3 flex items-center"
            >
              Withdraw
            </Title>
            <InfoTooltip>
              <Text>Only unpublished funds are available to withdraw.</Text>
              <Link href={KANDEL_DOC_URL} target="_blank">
                <Caption className="text-primary underline">Learn more</Caption>
              </Link>
            </InfoTooltip>
          </div>
        </Dialog.Title>
        <Steps steps={steps} currentStep={currentStep} />
        <Dialog.Description className="text-left !mt-8">
          {stepInfos[currentStep - 1]?.body ?? undefined}
        </Dialog.Description>
        <Dialog.Footer className=" w-full">
          {stepInfos[currentStep - 1]?.button}
        </Dialog.Footer>
      </Dialog>
    </>
  )
}
