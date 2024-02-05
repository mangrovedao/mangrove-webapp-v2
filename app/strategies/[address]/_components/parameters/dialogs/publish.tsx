"use client"

import { InfoIcon, LucideChevronRight } from "lucide-react"
import React from "react"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { KANDEL_DOC_URL } from "@/constants/docs"
import { useStep } from "@/hooks/use-step"
import { cn } from "@/utils"
import Link from "next/link"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffers } from "../../../_utils/inventory"
import { usePublish } from "../mutations/use-publish"
import { DialogCompleted } from "./dialog-completed"

type Props = {
  open: boolean
  onClose: () => void
}

export function Publish({ open, onClose }: Props) {
  const [publishCompleted, togglePublishCompleted] = React.useState(false)

  const { strategyQuery, strategyStatusQuery, strategyAddress, mergedOffers } =
    useKandel()
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

  let steps = ["Set", "Deposit"]
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

  const publish = usePublish({
    stratInstance: strategy?.stratInstance,
    mergedOffers: mergedOffers as MergedOffers,
    volumes: { baseAmount, quoteAmount },
  })

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBaseAmount(upublishedBase),
              text: "MAX",
            }}
            value={baseAmount}
            label={"WETH amount"}
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
              text: "MAX",
            }}
            value={quoteAmount}
            label={"USDC amount"}
            customBalance={upublishedQuote}
            showBalance
            balanceLabel="Unpublished inventory"
            token={market?.quote}
            onChange={(e) => setQuoteAmount(e.target.value)}
            error={
              Number(quoteAmount) > Number(upublishedQuote)
                ? "Invalid amount"
                : ""
            }
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
        <div className="flex flex-col gap-4">
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
          </div>
          <div className="flex gap-4 p-2 rounded-lg bg-primary-foreground border-[0.1rem] border-green-bangladesh ">
            <div className="p-2 bg-primary-dark-green rounded-lg ">
              <InfoIcon className="h-6 w-6 text-green-caribbean" />
            </div>

            <div>
              <Caption>
                Funds are evenly distributed across the active strategy.
              </Caption>
              <Link href={KANDEL_DOC_URL} target="_blank">
                <Caption className="text-primary underline">Learn more</Caption>
              </Link>
            </div>
          </div>
        </div>
      ),

      button: (
        <Button
          disabled={publish.isPending}
          loading={publish.isPending}
          onClick={() =>
            publish.mutate(undefined, {
              onSuccess() {
                togglePublishCompleted(!publishCompleted)
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
        >
          Publish
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": publish.isPending,
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
      <DialogCompleted
        title={"Funds published"}
        open={publishCompleted}
        onClose={() => togglePublishCompleted(false)}
      />

      <Dialog open={!!open} onClose={onClose} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <div className="flex space-x-2 items-center">
            <Title
              as={"div"}
              variant={"header1"}
              className="space-x-3 flex items-center"
            >
              Publish
            </Title>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
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
