"use client"

import { LucideChevronRight } from "lucide-react"
import React from "react"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { useStep } from "@/hooks/use-step"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
import useKandel from "../../../_providers/kandel-strategy"
import { useDeposit } from "../mutations/use-deposit"
import { SuccessDialog } from "./succes-dialog"

type Props = {
  open: boolean
  onClose: () => void
  togglePublish: () => void
}

export function Deposit({ togglePublish, open, onClose }: Props) {
  const [depositCompleted, toggleDepositCompleted] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  const { strategyQuery, strategyAddress, baseToken, quoteToken } = useKandel()

  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: baseToken?.symbol,
    quote: quoteToken?.symbol,
    offers: strategyQuery.data?.offers,
  })

  let steps = ["Set", "Deposit"]
  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers

  const [baseAmount, setBaseAmount] = React.useState("")
  const [quoteAmount, setQuoteAmount] = React.useState("")

  const deposit = useDeposit({
    kandelInstance: strategy?.kandelInstance,
    volumes: { baseAmount, quoteAmount },
  })

  const { formatted: baseBalance } = useTokenBalance(baseToken ?? undefined)
  const { formatted: quoteBalance } = useTokenBalance(quoteToken ?? undefined)

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBaseAmount(baseBalance as string),
            }}
            value={baseAmount}
            label={`${baseToken?.symbol} amount`}
            showBalance
            token={baseToken}
            onChange={(e) => setBaseAmount(e.target.value)}
            error={
              Number(baseAmount) > Number(baseBalance)
                ? "Insufficient balance"
                : ""
            }
          />

          <EnhancedNumericInput
            value={quoteAmount}
            balanceAction={{
              onClick: () => setQuoteAmount(quoteBalance as string),
            }}
            label={`${quoteToken?.symbol} amount`}
            showBalance
            token={quoteToken}
            onChange={(e) => setQuoteAmount(e.target.value)}
            error={
              Number(quoteAmount) > Number(quoteBalance)
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
            Number(baseAmount) > Number(baseBalance) ||
            Number(quoteAmount) > Number(quoteBalance)
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
        <div className="grid gap-2 p-5 bg-primary-dark-green rounded-lg">
          <Title>Review</Title>
          <div className="flex justify-between">
            <Text>{baseToken?.symbol} deposit</Text>
            <Text className="text-primary">
              {baseAmount} {baseToken?.symbol}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text>{quoteToken?.symbol} deposit</Text>
            <Text className="text-primary">
              {quoteAmount} {quoteToken?.symbol}
            </Text>
          </div>
        </div>
      ),
      button: (
        <Button
          disabled={deposit.isPending}
          loading={deposit.isPending}
          onClick={() =>
            deposit.mutate(undefined, {
              onSettled(data, error, variables, context) {
                if (!error) {
                  toggleDepositCompleted()
                }
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
          size={"lg"}
        >
          Deposit
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": deposit.isPending,
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

  const closeDialog = () => {
    setBaseAmount("")
    setQuoteAmount("")
    reset()
    onClose()
  }

  return (
    <>
      <SuccessDialog
        title="Deposit completed"
        actionButton={
          <Button
            className="w-full"
            size={"lg"}
            onClick={() => {
              toggleDepositCompleted()
              togglePublish()
            }}
          >
            Publish now
          </Button>
        }
        open={depositCompleted}
        onClose={toggleDepositCompleted}
      />

      <Dialog open={!!open} onClose={closeDialog} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <Title
            as={"div"}
            variant={"header1"}
            className="space-x-3 flex items-center"
          >
            Deposit
          </Title>
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
