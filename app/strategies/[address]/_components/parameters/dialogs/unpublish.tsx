"use client"

import { InfoIcon, LucideChevronRight } from "lucide-react"
import Link from "next/link"
import React from "react"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { KANDEL_DOC_URL } from "@/constants/docs"
import { useStep } from "@/hooks/use-step"
import { cn } from "@/utils"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../hook/use-parameters"
import { useUnPublish } from "../mutations/use-unpublish"
import { SuccessDialog } from "./succes-dialog"

type Props = {
  open: boolean
  onClose: () => void
}

export function UnPublish({ open, onClose }: Props) {
  const [unpublishCompleted, toggleUnPublishCompleted] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  const {
    strategyQuery,
    strategyAddress,
    mergedOffers,
    baseToken,
    quoteToken,
  } = useKandel()
  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: baseToken?.symbol,
    quote: quoteToken?.symbol,
    offers: strategyQuery.data?.offers,
  })

  let steps = ["Set", "Unpublish"]
  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers

  const [baseAmount, setBaseAmount] = React.useState("")
  const [quoteAmount, setQuoteAmount] = React.useState("")

  const { publishedBase, publishedQuote } = useParameters()

  const publishBaseFormatted = Number(publishedBase)?.toFixed(
    baseToken?.displayDecimals,
  )
  const publishQuoteFormatted = Number(publishedQuote)?.toFixed(
    baseToken?.displayDecimals,
  )

  const publish = useUnPublish({
    kandelInstance: strategy?.kandelInstance,
    mergedOffers: mergedOffers,
    volumes: { baseAmount, quoteAmount },
  })

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBaseAmount(publishBaseFormatted || ""),
            }}
            value={baseAmount}
            label={`${baseToken?.symbol} amount`}
            customBalance={publishBaseFormatted}
            showBalance
            balanceLabel="Unpublished inventory"
            token={baseToken}
            onChange={(e) => setBaseAmount(e.target.value)}
            error={
              Number(baseAmount) > Number(publishedBase)
                ? "Insufficient balance"
                : ""
            }
          />

          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setQuoteAmount(publishQuoteFormatted || ""),
            }}
            value={quoteAmount}
            label={`${quoteToken?.symbol} amount`}
            customBalance={publishQuoteFormatted}
            showBalance
            balanceLabel="Unpublished inventory"
            token={quoteToken}
            onChange={(e) => setQuoteAmount(e.target.value)}
            error={
              Number(quoteAmount) > Number(publishQuoteFormatted)
                ? "Insufficient balance"
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
            Number(baseAmount) > Number(publishedBase) ||
            Number(quoteAmount) > Number(publishedQuote)
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
        <div className="flex flex-col gap-4">
          <div className="grid gap-2 p-5 bg-primary-dark-green rounded-lg">
            <Title>Review</Title>
            <div className="flex justify-between">
              <Text>{baseToken?.symbol} amount</Text>
              <Text className="text-primary">
                {baseAmount} {baseToken?.symbol}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text>{quoteToken?.symbol} amount</Text>
              <Text className="text-primary">
                {quoteAmount} {quoteToken?.symbol}
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
                <Caption className="text-green-caribbean underline">
                  Learn more
                </Caption>
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
                toggleUnPublishCompleted()
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
          size={"lg"}
        >
          UnPublish
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
      <SuccessDialog
        title={"Funds Unpublished successfully"}
        open={unpublishCompleted}
        onClose={toggleUnPublishCompleted}
      />

      <Dialog open={!!open} onClose={onClose} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <div className="flex space-x-2 items-center">
            <Title
              as={"div"}
              variant={"header1"}
              className="space-x-3 flex items-center"
            >
              Unpublish
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
